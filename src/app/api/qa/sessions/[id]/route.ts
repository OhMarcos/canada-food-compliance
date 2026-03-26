/**
 * QA Session detail + manual review endpoint.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("qa_sessions")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("QA session detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * PATCH — Manual review: update quality_grade, failure_type, failure_notes.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { quality_grade, failure_type, failure_notes } = body;

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("qa_sessions")
      .update({
        quality_grade,
        failure_type: failure_type || null,
        failure_notes: failure_notes || null,
        reviewed_by: "admin",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ session: data });
  } catch (error) {
    console.error("QA session review error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
