"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/chat/markdown-content";

interface SessionDetail {
  readonly id: string;
  readonly question: string;
  readonly language: string;
  readonly raw_answer: string;
  readonly clean_answer: string;
  readonly citations: readonly {
    regulation_name: string;
    section_number: string;
    excerpt: string;
    official_url: string;
  }[];
  readonly citations_count: number;
  readonly confidence: string;
  readonly accuracy_score: number;
  readonly verified_count: number;
  readonly flagged_count: number;
  readonly verifier_notes: string | null;
  readonly quality_grade: string;
  readonly failure_type: string | null;
  readonly failure_notes: string | null;
  readonly reviewed_by: string | null;
  readonly contexts_found: number;
  readonly best_retrieval_score: number;
  readonly matched_topics: readonly string[];
  readonly processing_time_ms: number;
  readonly endpoint: string;
  readonly created_at: string;
}

const GRADE_OPTIONS = ["A", "B", "C", "D", "F"];
const FAILURE_OPTIONS = [
  "",
  "citation_leak",
  "no_context",
  "hallucination",
  "wrong_law",
  "incomplete",
  "format_error",
  "low_confidence",
];

export function QASessionDetail({ sessionId }: { readonly sessionId: string }) {
  const [session, setSession] = useState<SessionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRaw, setShowRaw] = useState(false);

  // Review form
  const [reviewGrade, setReviewGrade] = useState("");
  const [reviewFailure, setReviewFailure] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/qa/sessions/${sessionId}`);
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          setReviewGrade(data.session.quality_grade ?? "");
          setReviewFailure(data.session.failure_type ?? "");
          setReviewNotes(data.session.failure_notes ?? "");
        }
      } catch (err) {
        console.error("Failed to fetch session:", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId]);

  const handleSaveReview = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/qa/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quality_grade: reviewGrade,
          failure_type: reviewFailure || null,
          failure_notes: reviewNotes || null,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSession(data.session);
      }
    } catch (err) {
      console.error("Failed to save review:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!session) {
    return <p className="text-muted-foreground">Session not found</p>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className="text-lg px-3 py-1">{session.quality_grade}</Badge>
        <Badge variant="outline">{session.confidence}</Badge>
        {session.failure_type && (
          <Badge variant="destructive">{session.failure_type}</Badge>
        )}
        {session.reviewed_by && (
          <Badge variant="secondary">Reviewed by {session.reviewed_by}</Badge>
        )}
        <span className="text-sm text-muted-foreground ml-auto">
          {new Date(session.created_at).toLocaleString()} | {session.endpoint} | {session.language}
        </span>
      </div>

      {/* Question */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Question</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">{session.question}</p>
        </CardContent>
      </Card>

      {/* Answer (clean vs raw toggle) */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Answer</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRaw(!showRaw)}
              className="text-xs"
            >
              {showRaw ? "Show Clean" : "Show Raw"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <MarkdownContent text={showRaw ? session.raw_answer : session.clean_answer} />
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Contexts", value: session.contexts_found },
          { label: "Retrieval Score", value: session.best_retrieval_score?.toFixed(2) ?? "N/A" },
          { label: "Citations", value: session.citations_count },
          { label: "Verified / Flagged", value: `${session.verified_count} / ${session.flagged_count}` },
          { label: "Time", value: `${(session.processing_time_ms / 1000).toFixed(1)}s` },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="p-3 text-center">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Citations */}
      {session.citations.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Citations ({session.citations.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {session.citations.map((cite, i) => (
              <div key={i} className="border-l-2 border-blue-500 pl-3 py-1">
                <p className="text-sm font-medium">{cite.regulation_name}</p>
                <p className="text-xs text-muted-foreground">{cite.section_number}</p>
                <p className="text-xs mt-1">{cite.excerpt}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Verifier Notes */}
      {session.verifier_notes && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Verifier Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{session.verifier_notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Manual Review Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Manual Review</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Grade</label>
              <select
                value={reviewGrade}
                onChange={(e) => setReviewGrade(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Failure Type</label>
              <select
                value={reviewFailure}
                onChange={(e) => setReviewFailure(e.target.value)}
                className="text-sm border rounded px-2 py-1"
              >
                {FAILURE_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t || "(none)"}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Notes</label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              className="w-full text-sm border rounded px-2 py-1 h-20"
              placeholder="What went wrong? What should improve?"
            />
          </div>
          <Button onClick={handleSaveReview} disabled={saving} size="sm">
            {saving ? "Saving..." : "Save Review"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
