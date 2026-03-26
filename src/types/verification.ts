import { z } from "zod";

// ============================================
// Citation Verification Result
// ============================================
export const CitationVerificationSchema = z.object({
  citation_id: z.string(),
  section_id: z.string(),
  exists_in_db: z.boolean(),
  text_match_score: z.number().min(0).max(1),
  url_valid: z.boolean().nullable(),
  source_type: z.enum(["db", "web", "unknown"]).default("unknown"),
  web_authority_score: z.number().min(0).max(1).optional(),
  status: z.enum(["verified", "not_found", "text_mismatch", "partial_match", "web_trusted"]),
});

export type CitationVerification = Readonly<z.infer<typeof CitationVerificationSchema>>;

// ============================================
// LLM Verification Result
// ============================================
export const LLMVerificationSchema = z.object({
  is_accurate: z.boolean(),
  accuracy_score: z.number().min(0).max(1),
  issues: z.array(z.object({
    type: z.enum(["overclaim", "missing_nuance", "wrong_interpretation", "outdated", "missing_regulation"]),
    description: z.string(),
    severity: z.enum(["critical", "major", "minor"]),
    suggested_correction: z.string().optional(),
  })),
  missing_regulations: z.array(z.object({
    regulation_name: z.string(),
    section: z.string(),
    reason: z.string(),
  })),
  verifier_notes: z.string(),
});

export type LLMVerification = Readonly<z.infer<typeof LLMVerificationSchema>>;

// ============================================
// Full Verification Result
// ============================================
export const VerificationResultSchema = z.object({
  overall_confidence: z.enum(["HIGH", "MEDIUM", "LOW", "UNVERIFIED"]),
  citation_checks: z.array(CitationVerificationSchema),
  llm_verification: LLMVerificationSchema.nullable(),
  total_citations: z.number(),
  verified_count: z.number(),
  flagged_count: z.number(),
  processing_time_ms: z.number(),
  verified_at: z.string(),
});

export type VerificationResult = Readonly<z.infer<typeof VerificationResultSchema>>;

// ============================================
// Official Canadian Government Domains
// Ranked by legal authority for citation trust scoring
// ============================================
const AUTHORITY_DOMAINS: readonly { readonly domain: string; readonly score: number }[] = [
  { domain: "laws-lois.justice.gc.ca", score: 1.0 },   // Official legal texts
  { domain: "gazette.gc.ca", score: 0.95 },             // Canada Gazette
  { domain: "inspection.canada.ca", score: 0.9 },       // CFIA official
  { domain: "canada.ca", score: 0.85 },                 // Government portal
  { domain: "hc-sc.gc.ca", score: 0.85 },               // Health Canada
  { domain: "cbsa-asfc.gc.ca", score: 0.85 },           // CBSA
];

/**
 * Compute authority score for a web URL based on domain trust.
 * Returns 0.6 for unknown .gc.ca domains, 0 for non-government.
 */
export function computeWebAuthorityScore(url: string): number {
  if (!url) return 0;
  for (const { domain, score } of AUTHORITY_DOMAINS) {
    if (url.includes(domain)) return score;
  }
  if (url.includes(".gc.ca") || url.includes(".canada.ca")) return 0.6;
  return 0;
}

/**
 * Check if a citation originates from an official government web source.
 */
export function isOfficialWebSource(url: string | undefined): boolean {
  if (!url) return false;
  return computeWebAuthorityScore(url) > 0;
}

// ============================================
// Confidence Calculation (Enhanced)
// ============================================

/**
 * Compute confidence using weighted multi-factor scoring.
 * Accounts for DB-verified citations, web-trusted citations,
 * and LLM verification results.
 */
export function computeConfidence(
  citationChecks: readonly CitationVerification[],
  llmVerification: LLMVerification | null,
): "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED" {
  if (citationChecks.length === 0) return "UNVERIFIED";

  // Weighted verification score (0-1)
  const weightedScore = citationChecks.reduce((sum, check) => {
    const weight = 1 / citationChecks.length;
    switch (check.status) {
      case "verified": return sum + weight * 1.0;
      case "web_trusted": return sum + weight * (check.web_authority_score ?? 0.8);
      case "partial_match": return sum + weight * 0.6;
      case "text_mismatch": return sum + weight * 0.2;
      case "not_found": return sum + weight * 0.0;
      default: return sum;
    }
  }, 0);

  // LLM verification factor (0-1)
  const llmFactor = llmVerification
    ? (llmVerification.is_accurate ? 1.0 : 0.5)
    : 0.8; // Slight penalty for missing LLM verification, not severe

  // Critical issues override
  const hasCriticalIssues = llmVerification?.issues?.some(
    (i) => i.severity === "critical",
  ) ?? false;
  if (hasCriticalIssues) return "LOW";

  // Combined score: 70% citation quality, 30% LLM assessment
  const combinedScore = weightedScore * 0.7 + llmFactor * 0.3;

  if (combinedScore >= 0.8) return "HIGH";
  if (combinedScore >= 0.6) return "MEDIUM";
  return "LOW";
}
