import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db/client";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

/**
 * Sanitize search input to prevent injection via Supabase filter strings.
 * Removes characters that could break out of ilike patterns.
 */
function sanitizeSearch(input: string): string {
  return input.replace(/[%_'"\\;]/g, "").trim().slice(0, 200);
}

export async function GET(request: NextRequest) {
  try {
    const clientId = getClientIdentifier(request);
    const rateCheck = checkRateLimit(`regulations:${clientId}`, RATE_LIMITS.api);
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

    const { searchParams } = new URL(request.url);
    const rawSearch = searchParams.get("search");
    const agency = searchParams.get("agency");
    const type = searchParams.get("type");
    const topic = searchParams.get("topic");
    const rawLimit = parseInt(searchParams.get("limit") ?? "50", 10);
    const limit = Math.min(Math.max(rawLimit, 1), 100);

    const supabase = getSupabaseClient();

    let query = supabase
      .from("regulations")
      .select(`
        *,
        agencies (
          id, name_en, name_ko, acronym
        )
      `)
      .eq("is_active", true)
      .order("short_name")
      .limit(limit);

    if (agency) {
      query = query.eq("agencies.acronym", sanitizeSearch(agency));
    }

    const VALID_STATUTE_TYPES = ["act", "regulation", "standard", "policy", "guideline"] as const;
    if (type) {
      if (!VALID_STATUTE_TYPES.includes(type as (typeof VALID_STATUTE_TYPES)[number])) {
        return NextResponse.json(
          { error: `Invalid type. Must be one of: ${VALID_STATUTE_TYPES.join(", ")}` },
          { status: 400 },
        );
      }
      query = query.eq("statute_type", type);
    }

    if (topic) {
      query = query.contains("applies_to", [sanitizeSearch(topic)]);
    }

    if (rawSearch) {
      const search = sanitizeSearch(rawSearch);
      if (search.length > 0) {
        query = query.or(
          `title_en.ilike.%${search}%,title_ko.ilike.%${search}%,short_name.ilike.%${search}%`,
        );
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error("Regulations query error:", error);
      return NextResponse.json(
        { error: "Failed to fetch regulations" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      regulations: data ?? [],
      total: data?.length ?? 0,
    });
  } catch (error) {
    console.error("Regulations API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
