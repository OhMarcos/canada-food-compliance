/**
 * Regression Test API — trigger test runs and view history.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import { runRegressionSuite } from "@/lib/qa/regression";

/**
 * GET — List regression run history.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data: runs, error } = await supabase
      .from("qa_regression_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ runs });
  } catch (error) {
    console.error("QA regression list error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST — Trigger a new regression test run.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const label = body.label as string | undefined;

    const result = await runRegressionSuite(label);

    return NextResponse.json({
      run_id: result.runId,
      total: result.totalCases,
      passed: result.passed,
      failed: result.failed,
      errors: result.errors,
      avg_quality_score: result.avgQualityScore,
      avg_confidence: result.avgConfidenceScore,
      avg_processing_ms: result.avgProcessingMs,
      results: result.results.map((r) => ({
        case_id: r.caseId,
        status: r.status,
        quality_score: r.qualityScore,
        score_breakdown: r.scoreBreakdown,
        confidence: r.actualConfidence,
        citation_match: r.citationMatch,
        keyword_match: r.keywordMatch,
        forbidden_clear: r.forbiddenClear,
        failure_reasons: r.failureReasons,
        processing_time_ms: r.processingTimeMs,
      })),
    });
  } catch (error) {
    console.error("QA regression run error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
