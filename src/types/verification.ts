import { z } from "zod";

// ============================================
// Citation Verification Result
// ============================================
export const CitationVerificationSchema = z.object({
  citation_id: z.string(),
  section_id: z.string().uuid(),
  exists_in_db: z.boolean(),
  text_match_score: z.number().min(0).max(1),
  url_valid: z.boolean().nullable(),
  status: z.enum(["verified", "not_found", "text_mismatch", "partial_match"]),
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
// Confidence Calculation
// ============================================
export function computeConfidence(
  citationChecks: readonly CitationVerification[],
  llmVerification: LLMVerification | null,
): "HIGH" | "MEDIUM" | "LOW" | "UNVERIFIED" {
  if (citationChecks.length === 0) return "UNVERIFIED";

  const verifiedCount = citationChecks.filter(c => c.status === "verified").length;
  const verifiedRatio = verifiedCount / citationChecks.length;

  if (!llmVerification) {
    if (verifiedRatio >= 0.9) return "MEDIUM";
    return "LOW";
  }

  const hasCriticalIssues = llmVerification.issues.some(i => i.severity === "critical");
  const hasMajorIssues = llmVerification.issues.some(i => i.severity === "major");

  if (hasCriticalIssues) return "LOW";
  if (verifiedRatio >= 0.9 && !hasMajorIssues && llmVerification.is_accurate) return "HIGH";
  if (verifiedRatio >= 0.7 && !hasCriticalIssues) return "MEDIUM";
  return "LOW";
}
