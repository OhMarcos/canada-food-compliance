import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getChecklist } from "@/lib/checklist/generator";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

const ChecklistRequestSchema = z.object({
  product_category: z.string().min(1).max(100),
  activity_type: z.enum(["production", "import", "export", "labeling", "general"]),
  origin_country: z.string().max(10).default("KR"),
});

export async function POST(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateCheck = checkRateLimit(`checklist:${clientId}`, RATE_LIMITS.api);
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
    const input = ChecklistRequestSchema.parse(body);

    const result = await getChecklist(
      input.product_category,
      input.activity_type,
      input.origin_country,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checklist API error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.issues },
        { status: 400 },
      );
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
