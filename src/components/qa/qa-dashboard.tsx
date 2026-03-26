"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QASessionList } from "./qa-session-list";
import { QASessionDetail } from "./qa-session-detail";
import { RegressionPanel } from "./regression-panel";

interface Stats {
  readonly totalSessions: number;
  readonly gradeCounts: Record<string, number>;
  readonly failureCounts: Record<string, number>;
  readonly avgProcessingMs: number;
  readonly confidenceCounts: Record<string, number>;
  readonly recentFailures: readonly {
    id: string;
    question: string;
    quality_grade: string;
    failure_type: string;
    confidence: string;
    created_at: string;
  }[];
  readonly latestRegressionRun: {
    passed_count: number;
    failed_count: number;
    total_cases: number;
    run_label: string;
    completed_at: string;
  } | null;
}

type Tab = "overview" | "sessions" | "regression";

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  D: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  F: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

function GradeBadge({ grade }: { readonly grade: string }) {
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold ${GRADE_COLORS[grade] ?? ""}`}>
      {grade}
    </span>
  );
}

function StatsOverview({ stats, onViewFailure }: {
  readonly stats: Stats;
  readonly onViewFailure: (id: string) => void;
}) {
  const total = stats.totalSessions;
  const passRate = total > 0
    ? Math.round(((stats.gradeCounts.A ?? 0) + (stats.gradeCounts.B ?? 0)) / total * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pass Rate (A+B)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{passRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Avg Response Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{(stats.avgProcessingMs / 1000).toFixed(1)}s</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Failures</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">
              {Object.values(stats.failureCounts).reduce((s, v) => s + v, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Distribution + Confidence */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Quality Grade Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {["A", "B", "C", "D", "F"].map((grade) => {
                const count = stats.gradeCounts[grade] ?? 0;
                const pct = total > 0 ? Math.round(count / total * 100) : 0;
                return (
                  <div key={grade} className="flex items-center gap-2">
                    <GradeBadge grade={grade} />
                    <div className="flex-1 bg-muted rounded-full h-4 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${grade === "A" ? "bg-green-500" : grade === "B" ? "bg-blue-500" : grade === "C" ? "bg-yellow-500" : grade === "D" ? "bg-orange-500" : "bg-red-500"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-16 text-right">{count} ({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Failure Types</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.failureCounts).length === 0 ? (
              <p className="text-sm text-muted-foreground">No failures detected</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(stats.failureCounts)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">{type}</Badge>
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Latest Regression Run */}
      {stats.latestRegressionRun && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Latest Regression Run</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge variant="outline">{stats.latestRegressionRun.run_label}</Badge>
              <span className="text-sm text-green-600">
                {stats.latestRegressionRun.passed_count} passed
              </span>
              <span className="text-sm text-red-600">
                {stats.latestRegressionRun.failed_count} failed
              </span>
              <span className="text-sm text-muted-foreground">
                / {stats.latestRegressionRun.total_cases} total
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Failures */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent Failures</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.recentFailures.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent failures</p>
          ) : (
            <div className="space-y-2">
              {stats.recentFailures.map((f) => (
                <button
                  key={f.id}
                  onClick={() => onViewFailure(f.id)}
                  className="w-full text-left p-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <GradeBadge grade={f.quality_grade} />
                    <span className="text-sm flex-1 truncate">{f.question}</span>
                    <Badge variant="destructive" className="text-xs">{f.failure_type}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function QADashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/qa/stats?days=${days}`);
      if (res.ok) {
        setStats(await res.json());
      }
    } catch (err) {
      console.error("Failed to fetch QA stats:", err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleViewFailure = (id: string) => {
    setSelectedSessionId(id);
    setTab("sessions");
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">QA Monitoring Dashboard</h1>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="text-sm border rounded px-2 py-1"
          >
            <option value={1}>Last 24h</option>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
          </select>
          <Button variant="outline" size="sm" onClick={fetchStats}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 border-b">
        {(["overview", "sessions", "regression"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "overview" ? "Overview" : t === "sessions" ? "Sessions" : "Regression Tests"}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading && tab === "overview" ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : tab === "overview" && stats ? (
        <StatsOverview stats={stats} onViewFailure={handleViewFailure} />
      ) : tab === "sessions" ? (
        selectedSessionId ? (
          <div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSessionId(null)}
              className="mb-4"
            >
              &larr; Back to list
            </Button>
            <QASessionDetail sessionId={selectedSessionId} />
          </div>
        ) : (
          <QASessionList onSelectSession={setSelectedSessionId} />
        )
      ) : tab === "regression" ? (
        <RegressionPanel />
      ) : null}
    </div>
  );
}
