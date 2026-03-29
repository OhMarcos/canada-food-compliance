/**
 * Product check API endpoint.
 * Accepts product label images, extracts info via Claude Vision,
 * then runs compliance assessment against Canadian food regulations.
 */

import { NextRequest } from "next/server";
import { ZodError } from "zod";
import { ProductCheckInputSchema } from "@/lib/validators/product-check";
import { extractProductInfo } from "@/lib/ai/product-analyzer";
import { checkCompliance } from "@/lib/ai/compliance-checker";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";
import { getSessionId } from "@/lib/analytics/session";
import { captureEvent } from "@/lib/analytics/events";
import { requireFreeTier, recordFreeTierUsage, isFreeTierSuccess } from "@/lib/auth/free-tier";

export const maxDuration = 60; // Allow up to 60s for vision + RAG + compliance

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Free-tier access check
    const accessResult = await requireFreeTier(request, "product-check");
    if (!isFreeTierSuccess(accessResult)) {
      return accessResult;
    }

    // Rate limit
    const clientId = accessResult.user?.id ?? getClientIdentifier(request);
    const rateCheck = checkRateLimit(`product-check:${clientId}`, RATE_LIMITS.productCheck);
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

    const body = await request.json();
    const input = ProductCheckInputSchema.parse(body);
    const sessionId = await getSessionId(request);

    // Step 1: Extract product info from images
    const extractedInfo = await extractProductInfo(input.images);

    // Step 2: Check compliance against Canadian regulations
    const { report, contexts } = await checkCompliance(extractedInfo);

    // Build regulation references from contexts
    const regulationRefs = contexts
      .filter((c) => c.score >= 0.4)
      .slice(0, 10)
      .map((c) => ({
        regulation_name: `${c.regulation_name} (${c.regulation_short_name})`,
        section_number: c.section_number,
        official_url: c.section_url ?? c.official_url,
      }));

    const processingTime = Date.now() - startTime;

    // Record free-tier usage
    const usageCookie = recordFreeTierUsage(request, accessResult, "product-check");

    // Flywheel: capture product check analytics (fire-and-forget)
    captureEvent({
      session_id: sessionId,
      event_type: "product_check",
      event_action: "success",
      language: input.language,
      processing_time_ms: processingTime,
      metadata: {
        product_name: extractedInfo.product_name,
        manufacturer: extractedInfo.manufacturer,
        category: extractedInfo.product_category,
        origin_country: extractedInfo.origin_country,
        compliance_status: report.feasibility,
        major_issues: report.items
          .filter((item) => item.status === "fail")
          .map((item) => item.requirement),
        regulation_refs_count: regulationRefs.length,
      },
    });

    const responseHeaders: Record<string, string> = { "Content-Type": "application/json" };
    if (usageCookie) {
      responseHeaders["Set-Cookie"] = usageCookie;
    }

    return new Response(
      JSON.stringify({
        extracted_info: extractedInfo,
        compliance_report: report,
        regulation_references: regulationRefs,
        processing_time_ms: processingTime,
      }),
      { status: 200, headers: responseHeaders },
    );
  } catch (error) {
    console.error("Product check API error:", error);

    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({ error: "Invalid request format", details: error.issues }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
