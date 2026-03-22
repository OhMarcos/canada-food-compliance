import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { marketCrossCheck } from "@/lib/market/scanner";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const MarketSearchSchema = z.object({
  product_name: z.string().min(1).max(200),
  category: z.string().max(100).optional(),
  origin_country: z.string().max(10).default("KR"),
  include_web_search: z.boolean().default(true),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
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

    const result = await marketCrossCheck({
      productName: input.product_name,
      category: input.category,
      originCountry: input.origin_country,
      includeWebSearch: input.include_web_search,
    });

    return NextResponse.json(result);
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
