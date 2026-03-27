/**
 * Prompt Regression Test Runner (v2).
 *
 * Enhanced with:
 * - Bilingual keyword matching (en + ko per keyword)
 * - Weighted quality scoring (0-100) instead of binary pass/fail
 * - Web source awareness in verification
 * - Null-safe DB field access
 */

import "server-only";
import { getSupabaseAdmin } from "@/lib/db/client";
import { generateAnswer } from "@/lib/ai/chat-engine";
import { verifyAnswer } from "@/lib/ai/verifier";
import { logQASession } from "./logger";

// ============================================
// Types
// ============================================

/** Bilingual keyword for matching in both EN and KO answers */
interface BilingualKeyword {
  readonly en: string;
  readonly ko?: string;
  readonly alternatives?: readonly string[];
}

/** Scoring weights for quality computation */
interface ScoringWeights {
  readonly citation_weight: number;
  readonly keyword_weight: number;
  readonly forbidden_weight: number;
  readonly confidence_weight: number;
}

const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  citation_weight: 0.3,
  keyword_weight: 0.3,
  forbidden_weight: 0.2,
  confidence_weight: 0.2,
};

interface RegressionCase {
  readonly id: string;
  readonly name: string;
  readonly category: string;
  readonly language: "ko" | "en";
  readonly question: string;
  readonly expected_citations: readonly { regulation_name: string; section_number?: string }[] | null;
  readonly expected_keywords: readonly string[] | null;
  readonly expected_keywords_v2: readonly BilingualKeyword[] | null;
  readonly forbidden_keywords: readonly string[] | null;
  readonly forbidden_keywords_v2: readonly BilingualKeyword[] | null;
  readonly scoring_weights: ScoringWeights | null;
  readonly min_confidence: string;
  readonly priority: number;
}

interface ScoreBreakdown {
  readonly citation: number;   // 0-100
  readonly keyword: number;    // 0-100
  readonly forbidden: number;  // 0-100
  readonly confidence: number; // 0-100
}

interface CaseResult {
  readonly caseId: string;
  readonly status: "excellent" | "good" | "acceptable" | "poor" | "error";
  readonly qualityScore: number; // 0-100
  readonly scoreBreakdown: ScoreBreakdown;
  readonly citationMatch: boolean;
  readonly keywordMatch: boolean;
  readonly forbiddenClear: boolean;
  readonly confidenceMet: boolean;
  readonly actualAnswer: string;
  readonly actualConfidence: string;
  readonly failureReasons: readonly string[];
  readonly processingTimeMs: number;
  readonly qaSessionId?: string;
}

// ============================================
// Keyword matching (bilingual)
// ============================================

/**
 * Match a keyword against the answer text.
 * Tries: primary language → other language → alternatives.
 */
function matchSingleKeyword(
  answerLower: string,
  keyword: BilingualKeyword,
  language: "ko" | "en",
): boolean {
  // Try primary language first
  const primary = language === "ko" ? (keyword.ko ?? keyword.en) : keyword.en;
  if (answerLower.includes(primary.toLowerCase())) return true;

  // Try other language
  const secondary = language === "ko" ? keyword.en : (keyword.ko ?? "");
  if (secondary && answerLower.includes(secondary.toLowerCase())) return true;

  // Try alternatives
  if (keyword.alternatives) {
    for (const alt of keyword.alternatives) {
      if (answerLower.includes(alt.toLowerCase())) return true;
    }
  }

  return false;
}

/**
 * Convert legacy string[] keywords to BilingualKeyword[].
 * If v2 keywords exist, use those. Otherwise, wrap v1 strings.
 */
function resolveKeywords(
  v1: readonly string[] | null,
  v2: readonly BilingualKeyword[] | null,
): readonly BilingualKeyword[] {
  if (v2 && v2.length > 0) return v2;
  if (!v1 || v1.length === 0) return [];
  return v1.map((kw) => ({ en: kw }));
}

/**
 * Match all keywords against the answer, returning match details.
 */
function matchKeywords(
  answerLower: string,
  keywords: readonly BilingualKeyword[],
  language: "ko" | "en",
): { readonly matched: number; readonly total: number; readonly missing: readonly string[] } {
  const missing: string[] = [];
  let matched = 0;

  for (const kw of keywords) {
    if (matchSingleKeyword(answerLower, kw, language)) {
      matched++;
    } else {
      const label = language === "ko" ? (kw.ko ?? kw.en) : kw.en;
      missing.push(label);
    }
  }

  return { matched, total: keywords.length, missing };
}

// ============================================
// Regulation name aliases (for fuzzy citation matching)
// ============================================

/** Map of regulation names to known aliases and abbreviations */
const REGULATION_ALIASES: ReadonlyMap<string, readonly string[]> = new Map([
  ["safe food for canadians act", ["sfca", "sfca act", "safe food for canadians"]],
  ["safe food for canadians regulations", ["sfcr", "sfcr regulations", "safe food for canadians"]],
  ["food and drug regulations", ["fdr", "food and drug regs", "c.r.c., c. 870"]],
  ["food and drugs act", ["fda", "food and drugs", "f&d act"]],
  ["consumer packaging and labelling act", ["cpla", "consumer packaging"]],
  ["canada agricultural products act", ["capa"]],
  ["meat inspection act", ["mia"]],
  ["health of animals act", ["haa"]],
  ["pest control products act", ["pcpa"]],
  ["canada organic regime", ["cor", "organic regime"]],
  ["novel food regulations", ["novel foods"]],
]);

/**
 * Check if two regulation names match, considering aliases.
 */
function regulationNameMatches(actual: string, expected: string): boolean {
  const a = actual.toLowerCase();
  const e = expected.toLowerCase();

  // Direct substring match
  if (a.includes(e) || e.includes(a)) return true;

  // Check aliases for expected
  for (const [canonical, aliases] of REGULATION_ALIASES) {
    const isExpectedMatch = e.includes(canonical) || aliases.some((alias) => e.includes(alias));
    if (!isExpectedMatch) continue;
    const isActualMatch = a.includes(canonical) || aliases.some((alias) => a.includes(alias));
    if (isActualMatch) return true;
  }

  return false;
}

// ============================================
// Scoring
// ============================================

/** Confidence string → numeric score (0-1) */
function confidenceScore(c: string): number {
  switch (c) {
    case "HIGH": return 1.0;
    case "MEDIUM": return 0.67;
    case "LOW": return 0.33;
    default: return 0;
  }
}

/** Confidence hierarchy for comparison */
function confidenceRank(c: string): number {
  switch (c) {
    case "HIGH": return 3;
    case "MEDIUM": return 2;
    case "LOW": return 1;
    default: return 0;
  }
}

/** Classify quality score into status */
function classifyQuality(score: number): CaseResult["status"] {
  if (score >= 85) return "excellent";
  if (score >= 70) return "good";
  if (score >= 50) return "acceptable";
  return "poor";
}

// ============================================
// Case runner
// ============================================

/**
 * Run a single regression test case against the live pipeline.
 */
async function runCase(testCase: RegressionCase): Promise<CaseResult> {
  const startTime = Date.now();

  try {
    // 1. Generate answer through the full pipeline
    const qaResult = await generateAnswer(testCase.question, {
      language: testCase.language,
    });

    // 2. Run verification (with fallback for pipeline errors)
    let verification;
    try {
      verification = await verifyAnswer(
        testCase.question,
        qaResult.answer,
        qaResult.citations,
        qaResult.contexts.map((c) => ({
          content: c.content,
          section_number: c.section_number,
          regulation_name: c.regulation_name,
        })),
      );
    } catch (verifyError) {
      console.error(`[regression] Verification failed for case ${testCase.id}:`, verifyError);
      verification = {
        overall_confidence: "UNVERIFIED" as const,
        citation_checks: [] as { status: string }[],
        llm_verification: null,
        total_citations: qaResult.citations.length,
        verified_count: 0,
        flagged_count: 0,
        processing_time_ms: 0,
        verified_at: new Date().toISOString(),
      };
    }

    const confidence = verification.overall_confidence;
    const processingTimeMs = Date.now() - startTime;
    const failureReasons: string[] = [];
    const weights = testCase.scoring_weights ?? DEFAULT_SCORING_WEIGHTS;
    const answerLower = qaResult.answer.toLowerCase();

    // ── Check 1: Citation match (with alias resolution) ──
    const expectedCitations = testCase.expected_citations ?? [];
    const citationMatched = expectedCitations.length === 0 ||
      expectedCitations.some((expected) =>
        // Check in structured citations
        qaResult.citations.some((actual) =>
          regulationNameMatches(actual.regulation_name, expected.regulation_name) ||
          (expected.section_number && actual.section_number.includes(expected.section_number)),
        ) ||
        // Also check if the regulation name appears in the answer text itself
        regulationNameMatches(answerLower, expected.regulation_name),
      );
    const citationScore = expectedCitations.length === 0 ? 100 : (citationMatched ? 100 : 0);
    if (!citationMatched) {
      failureReasons.push(`Missing citations: ${expectedCitations.map((c) => c.regulation_name).join(", ")}`);
    }

    // ── Check 2: Expected keywords (bilingual) ──
    const resolvedExpected = resolveKeywords(testCase.expected_keywords, testCase.expected_keywords_v2);
    const kwResult = matchKeywords(answerLower, resolvedExpected, testCase.language);
    const keywordScore = resolvedExpected.length === 0 ? 100 : Math.round((kwResult.matched / kwResult.total) * 100);
    const keywordMatch = kwResult.missing.length === 0;
    if (!keywordMatch) {
      failureReasons.push(`Missing keywords: ${kwResult.missing.join(", ")}`);
    }

    // ── Check 3: Forbidden keywords (bilingual) ──
    const resolvedForbidden = resolveKeywords(testCase.forbidden_keywords, testCase.forbidden_keywords_v2);
    const forbResult = matchKeywords(answerLower, resolvedForbidden, testCase.language);
    const forbiddenScore = resolvedForbidden.length === 0 ? 100 : Math.round(((resolvedForbidden.length - forbResult.matched) / resolvedForbidden.length) * 100);
    const forbiddenClear = forbResult.matched === 0;
    if (!forbiddenClear) {
      const foundLabels = resolvedForbidden
        .filter((kw) => matchSingleKeyword(answerLower, kw, testCase.language))
        .map((kw) => kw.en);
      failureReasons.push(`Forbidden keywords found: ${foundLabels.join(", ")}`);
    }

    // ── Check 4: Confidence ──
    const confScore = Math.round(confidenceScore(confidence) * 100);
    const confidenceMet = confidenceRank(confidence) >= confidenceRank(testCase.min_confidence);
    if (!confidenceMet) {
      failureReasons.push(`Confidence ${confidence} < minimum ${testCase.min_confidence}`);
    }

    // ── Weighted quality score ──
    const qualityScore = Math.round(
      citationScore * weights.citation_weight +
      keywordScore * weights.keyword_weight +
      forbiddenScore * weights.forbidden_weight +
      confScore * weights.confidence_weight,
    );

    const status = classifyQuality(qualityScore);
    const scoreBreakdown: ScoreBreakdown = {
      citation: citationScore,
      keyword: keywordScore,
      forbidden: forbiddenScore,
      confidence: confScore,
    };

    // ── Log QA session ──
    const bestScore = qaResult.contexts.length > 0
      ? Math.max(...qaResult.contexts.map((c) => c.score))
      : 0;

    logQASession({
      sessionId: `regression-${testCase.id}`,
      question: testCase.question,
      language: testCase.language,
      historyTurns: 0,
      contextsFound: qaResult.contexts.length,
      bestRetrievalScore: bestScore,
      matchedTopics: [...new Set(qaResult.contexts.flatMap((c) => [...c.topics]))],
      rawAnswer: qaResult.rawAnswer,
      cleanAnswer: qaResult.answer,
      citations: qaResult.citations,
      confidence,
      accuracyScore: verification.llm_verification?.accuracy_score,
      verifiedCount: (verification.citation_checks ?? []).filter((c) => c.status === "verified" || c.status === "web_trusted").length,
      flaggedCount: (verification.citation_checks ?? []).filter((c) => c.status === "not_found" || c.status === "text_mismatch").length,
      verifierNotes: verification.llm_verification?.verifier_notes,
      processingTimeMs,
      endpoint: "non-stream",
    });

    return {
      caseId: testCase.id,
      status,
      qualityScore,
      scoreBreakdown,
      citationMatch: citationMatched,
      keywordMatch,
      forbiddenClear,
      confidenceMet,
      actualAnswer: qaResult.answer,
      actualConfidence: confidence,
      failureReasons,
      processingTimeMs,
    };
  } catch (error) {
    return {
      caseId: testCase.id,
      status: "error",
      qualityScore: 0,
      scoreBreakdown: { citation: 0, keyword: 0, forbidden: 0, confidence: 0 },
      citationMatch: false,
      keywordMatch: false,
      forbiddenClear: true,
      confidenceMet: false,
      actualAnswer: error instanceof Error ? error.message : "Unknown error",
      actualConfidence: "UNVERIFIED",
      failureReasons: [`Error: ${error instanceof Error ? error.message : "Unknown"}`],
      processingTimeMs: Date.now() - startTime,
    };
  }
}

// ============================================
// Suite runner
// ============================================

export interface RegressionRunResult {
  readonly runId: string;
  readonly totalCases: number;
  readonly passed: number;
  readonly failed: number;
  readonly errors: number;
  readonly avgQualityScore: number;
  readonly avgConfidenceScore: number;
  readonly avgProcessingMs: number;
  readonly results: readonly CaseResult[];
}

/**
 * Run all active regression test cases and persist results.
 */
export async function runRegressionSuite(
  runLabel?: string,
): Promise<RegressionRunResult> {
  const supabase = getSupabaseAdmin();

  // Fetch active test cases
  const { data: cases, error } = await supabase
    .from("qa_regression_cases")
    .select("*")
    .eq("is_active", true)
    .order("priority", { ascending: true });

  if (error || !cases) {
    throw new Error(`Failed to fetch regression cases: ${error?.message}`);
  }

  // Create the run record
  const { data: run, error: runError } = await supabase
    .from("qa_regression_runs")
    .insert({
      run_label: runLabel ?? `run-${new Date().toISOString().slice(0, 10)}`,
      total_cases: cases.length,
    })
    .select("id")
    .single();

  if (runError || !run) {
    throw new Error(`Failed to create regression run: ${runError?.message}`);
  }

  // Execute cases sequentially (to avoid rate limiting)
  const results: CaseResult[] = [];
  for (const [index, testCase] of cases.entries()) {
    console.log(`[regression] Running case ${index + 1}/${cases.length}: ${testCase.name}`);
    const result = await runCase(testCase as unknown as RegressionCase);
    results.push(result);

    // Persist individual result
    await supabase.from("qa_regression_results").insert({
      run_id: run.id,
      case_id: testCase.id,
      status: result.status,
      citation_match: result.citationMatch,
      keyword_match: result.keywordMatch,
      forbidden_clear: result.forbiddenClear,
      confidence_met: result.confidenceMet,
      actual_answer: result.actualAnswer.slice(0, 5000),
      actual_confidence: result.actualConfidence,
      failure_reasons: result.failureReasons as string[],
      processing_time_ms: result.processingTimeMs,
      quality_score: result.qualityScore,
      score_breakdown: result.scoreBreakdown,
    });
  }

  // Compute aggregates
  const excellent = results.filter((r) => r.status === "excellent").length;
  const good = results.filter((r) => r.status === "good").length;
  const acceptable = results.filter((r) => r.status === "acceptable").length;
  const poor = results.filter((r) => r.status === "poor").length;
  const errors = results.filter((r) => r.status === "error").length;
  const avgQuality = results.reduce((s, r) => s + r.qualityScore, 0) / Math.max(results.length, 1);
  const avgConfidence = results.reduce(
    (sum, r) => sum + confidenceRank(r.actualConfidence), 0,
  ) / Math.max(results.length, 1) / 3;
  const avgMs = results.reduce((sum, r) => sum + r.processingTimeMs, 0) / Math.max(results.length, 1);

  await supabase
    .from("qa_regression_runs")
    .update({
      passed_count: excellent + good,
      failed_count: poor,
      skipped_count: errors,
      avg_confidence_score: Math.round(avgConfidence * 100) / 100,
      avg_processing_ms: Math.round(avgMs),
      completed_at: new Date().toISOString(),
    })
    .eq("id", run.id);

  return {
    runId: run.id,
    totalCases: cases.length,
    passed: excellent + good,
    failed: poor + acceptable,
    errors,
    avgQualityScore: Math.round(avgQuality),
    avgConfidenceScore: avgConfidence,
    avgProcessingMs: avgMs,
    results,
  };
}
