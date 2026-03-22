import { NextRequest, NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/db/client";
import { checkRateLimit, getClientIdentifier, RATE_LIMITS } from "@/lib/rate-limit";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const clientId = getClientIdentifier(request);
    const rateCheck = checkRateLimit(`regulation-detail:${clientId}`, RATE_LIMITS.api);
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

    const { id } = await params;

    // Validate UUID format to prevent invalid queries
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: "Invalid regulation ID" }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get regulation with agency
    const { data: regulation, error: regError } = await supabase
      .from("regulations")
      .select(`
        *,
        agencies (*)
      `)
      .eq("id", id)
      .single();

    if (regError || !regulation) {
      return NextResponse.json({ error: "Regulation not found" }, { status: 404 });
    }

    // Get sections for this regulation
    const { data: sections, error: secError } = await supabase
      .from("regulation_sections")
      .select("*")
      .eq("regulation_id", id)
      .order("sort_order");

    if (secError) {
      console.error("Sections query error:", secError);
      return NextResponse.json(
        { error: "Failed to load regulation sections" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      regulation,
      sections: sections ?? [],
    });
  } catch (error) {
    console.error("Regulation detail API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
