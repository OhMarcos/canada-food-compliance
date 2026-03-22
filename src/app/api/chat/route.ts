import { NextRequest, NextResponse } from "next/server";
import { v4 as uuid } from "uuid";
import { ChatInputSchema } from "@/lib/validators/chat";
import { generateAnswer } from "@/lib/ai/chat-engine";
import { verifyAnswer } from "@/lib/ai/verifier";
import { marketCrossCheck } from "@/lib/market/scanner";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit check
    const clientId = getClientIdentifier(request);
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

    const body = await request.json();
    const input = ChatInputSchema.parse(body);
    const startTime = Date.now();

    // Step 1: Generate answer with citations
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
            .filter((c) => c.status === "verified")
            .map((c) => c.section_id),
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
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Chat API error:", error);

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid request format", details: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
