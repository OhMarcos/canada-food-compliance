"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Session {
  readonly id: string;
  readonly question: string;
  readonly quality_grade: string;
  readonly failure_type: string | null;
  readonly confidence: string;
  readonly citations_count: number;
  readonly processing_time_ms: number;
  readonly language: string;
  readonly endpoint: string;
  readonly created_at: string;
}

const GRADE_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  B: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  C: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  D: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  F: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export function QASessionList({
  onSelectSession,
}: {
  readonly onSelectSession: (id: string) => void;
}) {
  const [sessions, setSessions] = useState<readonly Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [gradeFilter, setGradeFilter] = useState("");
  const [failureFilter, setFailureFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (gradeFilter) params.set("grade", gradeFilter);
        if (failureFilter) params.set("failure_type", failureFilter);

        const res = await fetch(`/api/qa/sessions?${params}`);
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions);
          setTotal(data.pagination.total);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, gradeFilter, failureFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <select
          value={gradeFilter}
          onChange={(e) => { setGradeFilter(e.target.value); setPage(1); }}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">All Grades</option>
          {["A", "B", "C", "D", "F"].map((g) => (
            <option key={g} value={g}>Grade {g}</option>
          ))}
        </select>
        <select
          value={failureFilter}
          onChange={(e) => { setFailureFilter(e.target.value); setPage(1); }}
          className="text-sm border rounded px-2 py-1"
        >
          <option value="">All Types</option>
          {["citation_leak", "no_context", "hallucination", "wrong_law", "incomplete", "format_error", "low_confidence"].map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        <span className="text-sm text-muted-foreground self-center">
          {total} sessions
        </span>
      </div>

      {/* Session List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      ) : sessions.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">No sessions found</p>
      ) : (
        <div className="border rounded-lg divide-y">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold flex-shrink-0 ${GRADE_COLORS[session.quality_grade] ?? ""}`}>
                  {session.quality_grade}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{session.question}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{session.confidence}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {session.citations_count} citations
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {(session.processing_time_ms / 1000).toFixed(1)}s
                    </span>
                    {session.failure_type && (
                      <Badge variant="destructive" className="text-xs">{session.failure_type}</Badge>
                    )}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {new Date(session.created_at).toLocaleString()}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            Previous
          </Button>
          <span className="text-sm self-center">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
