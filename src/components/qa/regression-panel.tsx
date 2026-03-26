"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RegressionRun {
  readonly id: string;
  readonly run_label: string;
  readonly total_cases: number;
  readonly passed_count: number;
  readonly failed_count: number;
  readonly skipped_count: number;
  readonly avg_confidence_score: number;
  readonly avg_processing_ms: number;
  readonly started_at: string;
  readonly completed_at: string | null;
}

interface RunResult {
  readonly id: string;
  readonly status: string;
  readonly citation_match: boolean;
  readonly keyword_match: boolean;
  readonly forbidden_clear: boolean;
  readonly confidence_met: boolean;
  readonly actual_confidence: string;
  readonly failure_reasons: readonly string[];
  readonly processing_time_ms: number;
  readonly qa_regression_cases: {
    name: string;
    category: string;
    question: string;
    priority: number;
  };
}

function RunDetail({ runId }: { readonly runId: string }) {
  const [results, setResults] = useState<readonly RunResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qa/regression/${runId}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results);
        }
      } catch (err) {
        console.error("Failed to fetch run detail:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [runId]);

  if (loading) {
    return <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto" />;
  }

  return (
    <div className="space-y-2 mt-3">
      {results.map((r) => (
        <div key={r.id} className="border rounded p-2 text-sm">
          <div className="flex items-center gap-2">
            <Badge variant={r.status === "passed" ? "default" : "destructive"} className="text-xs">
              {r.status}
            </Badge>
            <span className="font-medium">{r.qa_regression_cases?.name}</span>
            <Badge variant="outline" className="text-xs">{r.qa_regression_cases?.category}</Badge>
            <span className="text-xs text-muted-foreground ml-auto">
              {(r.processing_time_ms / 1000).toFixed(1)}s
            </span>
          </div>
          {r.status === "failed" && r.failure_reasons.length > 0 && (
            <div className="mt-1 text-xs text-red-600">
              {r.failure_reasons.map((reason, i) => (
                <p key={i}>{reason}</p>
              ))}
            </div>
          )}
          <div className="flex gap-2 mt-1">
            {[
              { label: "Citation", ok: r.citation_match },
              { label: "Keywords", ok: r.keyword_match },
              { label: "No Forbidden", ok: r.forbidden_clear },
              { label: "Confidence", ok: r.confidence_met },
            ].map(({ label, ok }) => (
              <span key={label} className={`text-xs ${ok ? "text-green-600" : "text-red-600"}`}>
                {ok ? "\u2713" : "\u2717"} {label}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function RegressionPanel() {
  const [runs, setRuns] = useState<readonly RegressionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [expandedRun, setExpandedRun] = useState<string | null>(null);
  const [runLabel, setRunLabel] = useState("");

  const fetchRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/qa/regression");
      if (res.ok) {
        const data = await res.json();
        setRuns(data.runs);
      }
    } catch (err) {
      console.error("Failed to fetch runs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  const handleTriggerRun = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/qa/regression", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: runLabel || undefined }),
      });
      if (res.ok) {
        await fetchRuns();
        setRunLabel("");
      }
    } catch (err) {
      console.error("Failed to trigger run:", err);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Trigger New Run */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Run Regression Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <input
              type="text"
              value={runLabel}
              onChange={(e) => setRunLabel(e.target.value)}
              placeholder="Run label (optional, e.g. v1.3.0)"
              className="text-sm border rounded px-3 py-1.5 flex-1"
            />
            <Button onClick={handleTriggerRun} disabled={running} size="sm">
              {running ? "Running..." : "Run All Tests"}
            </Button>
          </div>
          {running && (
            <p className="text-xs text-muted-foreground mt-2">
              Running tests against the live pipeline. This may take a few minutes...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Run History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Run History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No regression runs yet</p>
          ) : (
            <div className="space-y-3">
              {runs.map((run) => {
                const passRate = run.total_cases > 0
                  ? Math.round(run.passed_count / run.total_cases * 100)
                  : 0;
                return (
                  <div key={run.id}>
                    <button
                      onClick={() => setExpandedRun(expandedRun === run.id ? null : run.id)}
                      className="w-full text-left p-3 border rounded hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{run.run_label}</Badge>
                        <div className="flex gap-2 text-sm">
                          <span className="text-green-600">{run.passed_count} passed</span>
                          <span className="text-red-600">{run.failed_count} failed</span>
                          {run.skipped_count > 0 && (
                            <span className="text-yellow-600">{run.skipped_count} errors</span>
                          )}
                        </div>
                        <span className="text-sm font-bold ml-auto">{passRate}%</span>
                        <span className="text-xs text-muted-foreground">
                          {run.completed_at
                            ? new Date(run.completed_at).toLocaleString()
                            : "In progress..."}
                        </span>
                      </div>
                      {run.avg_processing_ms > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Avg: {(run.avg_processing_ms / 1000).toFixed(1)}s per test
                        </p>
                      )}
                    </button>
                    {expandedRun === run.id && <RunDetail runId={run.id} />}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
