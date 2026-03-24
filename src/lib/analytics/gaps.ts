/**
 * Content gap detection for the data flywheel.
 * Automatically identifies queries where the system couldn't provide
 * confident answers, signaling missing content.
 */

import "server-only";
import { getSupabaseAdmin } from "@/lib/db/client";

/** Confidence threshold below which a gap signal is created */
const CONFIDENCE_THRESHOLD = 0.6;

/** Minimum retrieval score to consider contexts "relevant" */
const RETRIEVAL_SCORE_THRESHOLD = 0.5;

export interface GapCheckInput {
  readonly query: string;
  readonly language: string;
  readonly confidence: string; // 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED'
  readonly retrievalScore: number;
  readonly contextsFound: number;
  readonly matchedTopics: readonly string[];
}

/**
 * Check if a query response indicates a content gap and record it.
 * Fire-and-forget — never blocks the response.
 */
export function detectContentGap(input: GapCheckInput): void {
  const confidenceScore = confidenceToScore(input.confidence);
  const isGap =
    confidenceScore < CONFIDENCE_THRESHOLD ||
    input.contextsFound === 0 ||
    input.retrievalScore < RETRIEVAL_SCORE_THRESHOLD;

  if (!isGap) return;

  const gapType =
    input.contextsFound === 0
      ? "no_context"
      : input.retrievalScore < RETRIEVAL_SCORE_THRESHOLD
        ? "low_retrieval"
        : "low_confidence";

  (async () => {
    try {
      const supabase = getSupabaseAdmin();
      await supabase.from("content_gap_signals").insert({
        query: input.query,
        query_language: input.language,
        confidence: confidenceScore,
        retrieval_score: input.retrievalScore,
        contexts_found: input.contextsFound,
        gap_type: gapType,
        matched_topics: input.matchedTopics as string[],
      });
    } catch (err) {
      console.error("[analytics] Gap signal capture failed:", err);
    }
  })();
}

function confidenceToScore(confidence: string): number {
  switch (confidence) {
    case "HIGH": return 0.9;
    case "MEDIUM": return 0.7;
    case "LOW": return 0.4;
    default: return 0.2;
  }
}
