/**
 * QA Sessions API — list and filter QA sessions for monitoring.
 * Admin-only endpoint (requires service role key).
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 100);
    const grade = searchParams.get("grade");  // A, B, C, D, F
    const failureType = searchParams.get("failure_type");
    const confidence = searchParams.get("confidence");
    const from = searchParams.get("from");  // ISO date
    const to = searchParams.get("to");

    const supabase = getSupabaseAdmin();
    let query = supabase
      .from("qa_sessions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (grade) query = query.eq("quality_grade", grade);
    if (failureType) query = query.eq("failure_type", failureType);
    if (confidence) query = query.eq("confidence", confidence);
    if (from) query = query.gte("created_at", from);
    if (to) query = query.lte("created_at", to);

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      sessions: data,
      pagination: { page, limit, total: count ?? 0 },
    });
  } catch (error) {
    console.error("QA sessions API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
