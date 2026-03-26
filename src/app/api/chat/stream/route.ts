/**
 * Streaming chat API endpoint.
 * Streams answer text tokens, then appends verification and market check
 * metadata after the stream completes.
 */

import { NextRequest } from "next/server";
import { v4 as uuid } from "uuid";
import { ChatInputSchema } from "@/lib/validators/chat";
import { streamAnswer, stripCitationBlock } from "@/lib/ai/chat-engine";
import { verifyAnswer } from "@/lib/ai/verifier";
import { marketCrossCheck } from "@/lib/market/scanner";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { getSessionId } from "@/lib/analytics/session";
import { captureEvent } from "@/lib/analytics/events";
import { detectContentGap } from "@/lib/analytics/gaps";
import { logQASession } from "@/lib/qa/logger";
import { requireTokens, consumeTokens, isAuthSuccess } from "@/lib/auth/middleware";
import type { RetrievedContext } from "@/lib/rag/retriever";
import type { Citation } from "@/types/chat";

const METADATA_DELIMITER = "\n\n---METADATA---\n";

/**
 * Regex patterns for extracting citation JSON blocks from LLM output.
 * Matches both fenced and bare JSON.
 */
const CITATION_JSON_PATTERNS: readonly RegExp[] = [
  /```json\s*(\{[\s\S]*?"citations"[\s\S]*?\})\s*```/,
  /(\{\s*"citations"\s*:\s*\[[\s\S]*?\]\s*\})/,
];

/**
 * Parse citations from completed streamed text.
 * Handles both fenced (```json) and bare JSON citation blocks.
 */
function parseCitationsFromText(
  text: string,
  contexts: readonly RetrievedContext[],
): readonly Citation[] {
  for (const pattern of CITATION_JSON_PATTERNS) {
    const jsonMatch = text.match(pattern);
    if (!jsonMatch) continue;

    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (Array.isArray(parsed.citations) && parsed.citations.length > 0) {
        const citations: Citation[] = [];
        for (const cite of parsed.citations) {
          const matchedContext = contexts.find(
            (c) =>
              c.section_number === cite.section_number ||
              c.regulation_name.includes(cite.regulation_name) ||
              cite.regulation_name.includes(c.regulation_short_name),
          );
          citations.push({
            regulation_id: matchedContext?.regulation_id ?? "",
            section_id: matchedContext?.section_id ?? "",
            regulation_name: cite.regulation_name,
            section_number: cite.section_number,
            excerpt: cite.excerpt,
            official_url:
              cite.official_url || matchedContext?.official_url || "",
            relevance_score: matchedContext?.score ?? 0.5,
          });
        }
        return citations;
      }
    } catch {
      // Try next pattern
    }
  }

  // Fallback: derive citations from high-scoring contexts
  return contexts
    .filter((c) => c.score >= 0.5)
    .slice(0, 5)
    .map((c) => ({
      regulation_id: c.regulation_id,
      section_id: c.section_id,
      regulation_name: c.regulation_name,
      section_number: c.section_number,
      excerpt: c.content.slice(0, 200),
      official_url: c.official_url,
      relevance_score: c.score,
    }));
}

/**
 * Build the metadata payload after streaming completes.
 */
function buildMetadata(
  input: { readonly message: string; readonly include_market_check: boolean; readonly product_context?: { readonly name?: string; readonly category?: string; readonly origin_country?: string } },
  verification: Awaited<ReturnType<typeof verifyAnswer>>,
  marketCheck: Awaited<ReturnType<typeof marketCrossCheck>> | null,
  citations: readonly Citation[],
  startTime: number,
) {
  return {
    message_id: uuid(),
    citations,
    verification: {
      status:
        verification.overall_confidence === "HIGH"
          ? "verified"
          : verification.overall_confidence === "MEDIUM"
            ? "partial"
            : verification.overall_confidence === "LOW"
              ? "failed"
              : "pending",
      confidence: verification.overall_confidence,
      notes: verification.llm_verification?.verifier_notes,
      verified_citations: verification.citation_checks
        .filter((c) => c.status === "verified")
        .map((c) => c.section_id),
      flagged_citations: verification.citation_checks
        .filter(
          (c) => c.status === "not_found" || c.status === "text_mismatch",
        )
        .map((c) => c.section_id),
    },
    market_check: marketCheck
      ? {
          similar_products: marketCheck.web_products.map((p) => ({
            name: p.name,
            brand: p.brand,
            retailer: p.retailer,
            url: p.url,
          })),
          recall_history: marketCheck.recalls,
        }
      : undefined,
    conversation_id: uuid(),
    processing_time_ms: Date.now() - startTime,
  };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let step = "init";

  try {
    // Step 1: Auth + token check
    step = "auth";
    const authResult = await requireTokens("chat-stream");
    if (!isAuthSuccess(authResult)) {
      // Pass through the original NextResponse (preserves correct status + body)
      return authResult;
    }
    const { user } = authResult;

    // Step 2: Rate limit check (keyed by user ID)
    step = "rate-limit";
    const clientId = user.id ?? getClientIdentifier(request);
    const rateCheck = checkRateLimit(`stream:${clientId}`, RATE_LIMITS.stream);
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    // Step 3: Parse input
    step = "parse-input";
    const body = await request.json();
    const input = ChatInputSchema.parse(body);
    const sessionId = await getSessionId(request);

    // Step 4: RAG retrieval + LLM streaming
    step = "stream-answer";
    const { stream: streamResult, contexts } = await streamAnswer(
      input.message,
      {
        language: input.language,
        topics: input.product_context?.category
          ? [input.product_context.category]
          : undefined,
        history: input.history,
      },
    );

    const encoder = new TextEncoder();

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // Stream text tokens as they arrive
          let fullText = "";
          for await (const chunk of streamResult.textStream) {
            fullText += chunk;
            controller.enqueue(encoder.encode(chunk));
          }

          // Parse citations from the completed response, then strip JSON from answer
          const citations = parseCitationsFromText(fullText, contexts);
          const cleanAnswer = stripCitationBlock(fullText);

          // Run verification + market check in parallel
          const [verification, marketCheck] = await Promise.all([
            verifyAnswer(
              input.message,
              fullText,
              citations,
              contexts.map((c) => ({
                content: c.content,
                section_number: c.section_number,
                regulation_name: c.regulation_name,
              })),
            ),
            input.include_market_check && input.product_context?.name
              ? marketCrossCheck({
                  productName: input.product_context.name,
                  category: input.product_context.category,
                  originCountry:
                    input.product_context.origin_country ?? "KR",
                })
              : Promise.resolve(null),
          ]);

          // Append metadata delimiter + JSON (include clean_answer for client)
          const metadata = {
            ...buildMetadata(input, verification, marketCheck, citations, startTime),
            clean_answer: cleanAnswer,
          };
          controller.enqueue(
            encoder.encode(METADATA_DELIMITER + JSON.stringify(metadata)),
          );

          // Consume tokens (fire-and-forget)
          void consumeTokens(user.id, "chat-stream", `Stream: ${input.message.slice(0, 50)}`);

          // Flywheel: capture analytics (fire-and-forget)
          const bestScore = contexts.length > 0
            ? Math.max(...contexts.map((c) => c.score))
            : 0;
          const matchedTopics = [...new Set(contexts.flatMap((c) => [...c.topics]))];

          captureEvent({
            session_id: sessionId,
            event_type: "chat",
            event_action: "success",
            language: input.language,
            processing_time_ms: metadata.processing_time_ms,
            metadata: {
              confidence: verification.overall_confidence,
              contexts_found: contexts.length,
              retrieval_score: bestScore,
              topics: matchedTopics,
              has_market_check: !!marketCheck,
              streaming: true,
            },
          });

          detectContentGap({
            query: input.message,
            language: input.language,
            confidence: verification.overall_confidence,
            retrievalScore: bestScore,
            contextsFound: contexts.length,
            matchedTopics,
          });

          // QA monitoring: full session replay capture
          logQASession({
            sessionId,
            userId: user.id,
            question: input.message,
            language: input.language,
            historyTurns: input.history?.length ?? 0,
            contextsFound: contexts.length,
            bestRetrievalScore: bestScore,
            matchedTopics,
            rawAnswer: fullText,
            cleanAnswer,
            citations,
            confidence: verification.overall_confidence,
            accuracyScore: verification.llm_verification?.accuracy_score,
            verifiedCount: verification.citation_checks.filter((c) => c.status === "verified").length,
            flaggedCount: verification.citation_checks.filter((c) => c.status === "not_found" || c.status === "text_mismatch").length,
            verifierNotes: verification.llm_verification?.verifier_notes,
            processingTimeMs: metadata.processing_time_ms,
            endpoint: "stream",
          });

          controller.close();
        } catch (streamError) {
          console.error("Stream processing error:", streamError);
          const errorPayload = JSON.stringify({
            error: "Stream processing failed",
          });
          controller.enqueue(
            encoder.encode(METADATA_DELIMITER + errorPayload),
          );
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat stream API error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return new Response(
        JSON.stringify({
          error: "Invalid request format",
          details: error.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.error("Chat stream error details:", { step, name: errorName, message: errorMessage });

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        debug: `[${step}] ${errorMessage}`,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
