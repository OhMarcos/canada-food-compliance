/**
 * Regression Run Detail — view individual test results for a run.
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

    const { data: run, error: runError } = await supabase
      .from("qa_regression_runs")
      .select("*")
      .eq("id", id)
      .single();

    if (runError || !run) {
      return NextResponse.json({ error: "Run not found" }, { status: 404 });
    }

    const { data: results, error: resultsError } = await supabase
      .from("qa_regression_results")
      .select("*, qa_regression_cases(name, category, question, priority)")
      .eq("run_id", id)
      .order("created_at", { ascending: true });

    if (resultsError) {
      return NextResponse.json({ error: resultsError.message }, { status: 500 });
    }

    return NextResponse.json({ run, results });
  } catch (error) {
    console.error("QA regression detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
