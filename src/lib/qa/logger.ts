/**
 * QA Session Logger — captures full Q&A interactions for monitoring.
 * Fire-and-forget pattern: never blocks API responses.
 * Auto-classifies quality grade based on verification signals.
 */

import "server-only";
import { getSupabaseAdmin } from "@/lib/db/client";
import type { Citation } from "@/types/chat";

export interface QASessionInput {
  readonly sessionId: string;
  readonly userId?: string;

  // Input
  readonly question: string;
  readonly language: string;
  readonly historyTurns: number;

  // RAG
  readonly contextsFound: number;
  readonly bestRetrievalScore: number;
  readonly matchedTopics: readonly string[];

  // Output
  readonly rawAnswer: string;
  readonly cleanAnswer: string;
  readonly citations: readonly Citation[];

  // Verification
  readonly confidence: string;
  readonly accuracyScore?: number;
  readonly verifiedCount: number;
  readonly flaggedCount: number;
  readonly verifierNotes?: string;

  // Performance
  readonly processingTimeMs: number;
  readonly endpoint: "stream" | "non-stream";
}

/** Confidence string → numeric score */
function confidenceToNum(c: string): number {
  switch (c) {
    case "HIGH": return 0.9;
    case "MEDIUM": return 0.7;
    case "LOW": return 0.4;
    default: return 0.2;
  }
}

/**
 * Auto-classify quality grade based on signals.
 * A = confident + citations + fast
 * B = medium confidence or missing some citations
 * C = low confidence or slow
 * D = very low confidence or no context
 * F = zero context or critical failure
 */
function classifyQuality(input: QASessionInput): {
  readonly grade: string;
  readonly failureType: string | null;
} {
  const confScore = confidenceToNum(input.confidence);

  // Check for citation JSON leak (raw JSON still in clean answer)
  if (input.cleanAnswer.includes('"citations"') && input.cleanAnswer.includes('"regulation_name"')) {
    return { grade: "F", failureType: "citation_leak" };
  }

  // No context found at all
  if (input.contextsFound === 0) {
    return { grade: "F", failureType: "no_context" };
  }

  // No citations extracted
  if (input.citations.length === 0) {
    return { grade: "D", failureType: "incomplete" };
  }

  // Flagged citations > verified (likely hallucination)
  if (input.flaggedCount > input.verifiedCount && input.flaggedCount > 0) {
    return { grade: "D", failureType: "hallucination" };
  }

  // Grade by confidence + retrieval quality
  if (confScore >= 0.9 && input.bestRetrievalScore >= 0.6) {
    return { grade: "A", failureType: null };
  }
  if (confScore >= 0.7) {
    return { grade: "B", failureType: null };
  }
  if (confScore >= 0.4) {
    return { grade: "C", failureType: null };
  }
  return { grade: "D", failureType: "low_confidence" };
}

/**
 * Log a QA session for monitoring and replay.
 * Fire-and-forget — silently fails to never block the response.
 */
export function logQASession(input: QASessionInput): void {
  const { grade, failureType } = classifyQuality(input);

  (async () => {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("qa_sessions").insert({
        session_id: input.sessionId,
        user_id: input.userId || null,
        question: input.question,
        language: input.language,
        history_turns: input.historyTurns,
        contexts_found: input.contextsFound,
        best_retrieval_score: input.bestRetrievalScore,
        matched_topics: input.matchedTopics as string[],
        raw_answer: input.rawAnswer,
        clean_answer: input.cleanAnswer,
        citations_count: input.citations.length,
        citations: JSON.parse(JSON.stringify(input.citations)),
        confidence: input.confidence,
        accuracy_score: input.accuracyScore ?? confidenceToNum(input.confidence),
        verified_count: input.verifiedCount,
        flagged_count: input.flaggedCount,
        verifier_notes: input.verifierNotes,
        quality_grade: grade,
        failure_type: failureType,
        processing_time_ms: input.processingTimeMs,
        endpoint: input.endpoint,
      });
    } catch (err) {
      console.error("[qa-logger] Session capture failed:", err);
    }
  })();
}
