/**
 * QA Stats API — aggregate quality metrics for the dashboard.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/client";
import { requireAdmin, isAdminSuccess } from "@/lib/auth/admin";

export async function GET(request: NextRequest) {
  try {
    const adminResult = await requireAdmin();
    if (!isAdminSuccess(adminResult)) return adminResult;

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") ?? "7", 10);
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    const supabase = getSupabaseAdmin();

    // Grade distribution
    const { data: gradeData } = await supabase
      .from("qa_sessions")
      .select("quality_grade")
      .gte("created_at", since);

    const gradeCounts: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, F: 0 };
    for (const row of gradeData ?? []) {
      const g = row.quality_grade ?? "F";
      gradeCounts[g] = (gradeCounts[g] ?? 0) + 1;
    }

    // Failure type distribution
    const { data: failureData } = await supabase
      .from("qa_sessions")
      .select("failure_type")
      .gte("created_at", since)
      .not("failure_type", "is", null);

    const failureCounts: Record<string, number> = {};
    for (const row of failureData ?? []) {
      const ft = row.failure_type ?? "unknown";
      failureCounts[ft] = (failureCounts[ft] ?? 0) + 1;
    }

    // Avg processing time + confidence
    const { data: perfData } = await supabase
      .from("qa_sessions")
      .select("processing_time_ms, confidence")
      .gte("created_at", since);

    const totalSessions = perfData?.length ?? 0;
    const avgProcessingMs = totalSessions > 0
      ? Math.round(
          (perfData ?? []).reduce((s, r) => s + (r.processing_time_ms ?? 0), 0) / totalSessions,
        )
      : 0;

    const confidenceCounts: Record<string, number> = { HIGH: 0, MEDIUM: 0, LOW: 0, UNVERIFIED: 0 };
    for (const row of perfData ?? []) {
      const c = row.confidence ?? "UNVERIFIED";
      confidenceCounts[c] = (confidenceCounts[c] ?? 0) + 1;
    }

    // Recent failures (last 10)
    const { data: recentFailures } = await supabase
      .from("qa_sessions")
      .select("id, question, quality_grade, failure_type, confidence, created_at")
      .gte("created_at", since)
      .not("failure_type", "is", null)
      .order("created_at", { ascending: false })
      .limit(10);

    // Latest regression run
    const { data: latestRun } = await supabase
      .from("qa_regression_runs")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(1)
      .single();

    return NextResponse.json({
      period: { days, since },
      totalSessions,
      gradeCounts,
      failureCounts,
      avgProcessingMs,
      confidenceCounts,
      recentFailures: recentFailures ?? [],
      latestRegressionRun: latestRun ?? null,
    });
  } catch (error) {
    console.error("QA stats API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
