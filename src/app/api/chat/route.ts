import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ChatInputSchema } from "@/lib/validators/chat";
import { generateAnswer } from "@/lib/ai/chat-engine";
import { verifyAnswer } from "@/lib/ai/verifier";
import { marketCrossCheck } from "@/lib/market/scanner";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { getSessionId } from "@/lib/analytics/session";
import { captureEvent } from "@/lib/analytics/events";
import { detectContentGap } from "@/lib/analytics/gaps";
import { logQASession } from "@/lib/qa/logger";
import { requireTokens, consumeTokens, isAuthSuccess } from "@/lib/auth/middleware";

export async function POST(request: NextRequest) {
  let step = "init";
  try {
    // Step 1: Auth + token check
    step = "auth";
    const authResult = await requireTokens("chat");
    if (!isAuthSuccess(authResult)) return authResult;
    const { user } = authResult;

    // Step 2: Rate limit check (keyed by user ID)
    step = "rate-limit";
    const clientId = user.id ?? getClientIdentifier(request);
    const rateCheck = checkRateLimit(`chat:${clientId}`, RATE_LIMITS.chat);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          },
        },
      );
    }

    // Step 3: Parse input
    step = "parse-input";
    const body = await request.json();
    const input = ChatInputSchema.parse(body);
    const startTime = Date.now();
    const sessionId = await getSessionId(request);

    // Step 4: Generate answer with citations
    step = "generate-answer";
    const qaResult = await generateAnswer(input.message, {
      language: input.language,
      topics: input.product_context?.category
        ? [input.product_context.category]
        : undefined,
      history: input.history,
    });

    // Step 2: Verify the answer (runs in parallel with market check)
    const [verification, marketCheck] = await Promise.all([
      verifyAnswer(
        input.message,
        qaResult.answer,
        qaResult.citations,
        qaResult.contexts.map((c) => ({
          content: c.content,
          section_number: c.section_number,
          regulation_name: c.regulation_name,
        })),
      ),
      // Step 3: Market cross-check (if enabled)
      input.include_market_check && input.product_context?.name
        ? marketCrossCheck({
            productName: input.product_context.name,
            category: input.product_context.category,
            originCountry: input.product_context.origin_country ?? "KR",
          })
        : Promise.resolve(null),
    ]);

    const response = {
      message: {
        id: uuid(),
        role: "assistant" as const,
        content: qaResult.answer,
        citations: qaResult.citations,
        verification: {
          status: verification.overall_confidence === "HIGH" ? "verified" :
                  verification.overall_confidence === "MEDIUM" ? "partial" :
                  verification.overall_confidence === "LOW" ? "failed" : "pending",
          confidence: verification.overall_confidence,
          notes: verification.llm_verification?.verifier_notes,
          verified_citations: verification.citation_checks
            .filter((c) => c.status === "verified" || c.status === "web_trusted")
            .map((c) => c.section_id || c.citation_id),
          flagged_citations: verification.citation_checks
            .filter((c) => c.status === "not_found" || c.status === "text_mismatch")
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
        timestamp: new Date().toISOString(),
      },
      conversation_id: uuid(),
      processing_time_ms: Date.now() - startTime,
      cross_domain: qaResult.crossDomainRecommendation ? {
        suggested_domain: qaResult.crossDomainRecommendation.suggestedDomain,
        reason: qaResult.crossDomainRecommendation.reason,
      } : undefined,
    };

    // Consume tokens (fire-and-forget — already validated above)
    void consumeTokens(user.id, "chat", `Chat: ${input.message.slice(0, 50)}`);

    // Flywheel: capture analytics (fire-and-forget)
    const bestScore = qaResult.contexts.length > 0
      ? Math.max(...qaResult.contexts.map((c) => c.score))
      : 0;
    const matchedTopics = [...new Set(qaResult.contexts.flatMap((c) => [...c.topics]))];

    captureEvent({
      session_id: sessionId,
      event_type: "chat",
      event_action: "success",
      language: input.language,
      processing_time_ms: response.processing_time_ms,
      metadata: {
        confidence: verification.overall_confidence,
        contexts_found: qaResult.contexts.length,
        retrieval_score: bestScore,
        topics: matchedTopics,
        has_market_check: !!marketCheck,
      },
    });

    detectContentGap({
      query: input.message,
      language: input.language,
      confidence: verification.overall_confidence,
      retrievalScore: bestScore,
      contextsFound: qaResult.contexts.length,
      matchedTopics,
    });

    // QA monitoring: full session replay capture
    logQASession({
      sessionId,
      userId: user.id,
      question: input.message,
      language: input.language,
      historyTurns: input.history?.length ?? 0,
      contextsFound: qaResult.contexts.length,
      bestRetrievalScore: bestScore,
      matchedTopics,
      rawAnswer: qaResult.rawAnswer,
      cleanAnswer: qaResult.answer,
      citations: qaResult.citations,
      confidence: verification.overall_confidence,
      accuracyScore: verification.llm_verification?.accuracy_score,
      verifiedCount: verification.citation_checks.filter((c) => c.status === "verified").length,
      flaggedCount: verification.citation_checks.filter((c) => c.status === "not_found" || c.status === "text_mismatch").length,
      verifierNotes: verification.llm_verification?.verifier_notes,
      processingTimeMs: response.processing_time_ms,
      endpoint: "non-stream",
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request format", details: error.message },
        { status: 400 },
      );
    }

    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Chat error details:", { step, name: error instanceof Error ? error.name : "Unknown", message: errorMessage });

    return NextResponse.json(
      {
        error: "Internal server error",
        debug: `[${step}] ${errorMessage}`,
      },
      { status: 500 },
    );
  }
}
