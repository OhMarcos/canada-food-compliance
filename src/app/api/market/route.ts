import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { marketCrossCheck } from "@/lib/market/scanner";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { getSessionId } from "@/lib/analytics/session";
import { captureEvent } from "@/lib/analytics/events";
import { requireFreeTier, recordFreeTierUsage, isFreeTierSuccess } from "@/lib/auth/free-tier";

const MarketSearchSchema = z.object({
  product_name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  origin_country: z.string().max(10).default("KR"),
  include_web_search: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    // Free-tier access check
    const accessResult = await requireFreeTier(request, "market");
    if (!isFreeTierSuccess(accessResult)) return accessResult;

    // Rate limit
    const clientId = accessResult.user?.id ?? getClientIdentifier(request);
    const rateCheck = checkRateLimit(`market:${clientId}`, RATE_LIMITS.api);
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
    const input = MarketSearchSchema.parse(body);
    const sessionId = await getSessionId(request);
    const startTime = Date.now();

    const result = await marketCrossCheck({
      productName: input.product_name,
      category: input.category,
      originCountry: input.origin_country,
      includeWebSearch: input.include_web_search,
    });

    // Record free-tier usage
    const usageCookie = recordFreeTierUsage(request, accessResult, "market");

    // Flywheel: capture market search analytics (fire-and-forget)
    captureEvent({
      session_id: sessionId,
      event_type: "market_search",
      event_action: "success",
      processing_time_ms: Date.now() - startTime,
      metadata: {
        query: input.product_name,
        category: input.category,
        origin_country: input.origin_country,
        results_found: result.total_similar,
        has_recalls: result.recalls.length > 0,
        web_products_count: result.web_products.length,
        db_products_count: result.db_products.length,
      },
    });

    const jsonResponse = NextResponse.json(result);
    if (usageCookie) {
      jsonResponse.headers.set("Set-Cookie", usageCookie);
    }
    return jsonResponse;
  } catch (error) {
    console.error("Market API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
