/**
 * Three-step verification pipeline:
 * 1. Citation DB check - verify cited sections exist in database (parallel)
 * 2. LLM re-verification - Claude verifier checks answer accuracy
 * 3. Confidence scoring - compute overall confidence
 *
 * Steps 1 and 2 run in parallel for performance.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT_VERIFIER } from "./prompts";
import { getSectionById } from "@/lib/rag/retriever";
import type { Citation } from "@/types/chat";
import {
  type CitationVerification,
  type LLMVerification,
  type VerificationResult,
  computeConfidence,
} from "@/types/verification";

const VERIFIER_MODEL = "claude-sonnet-4-20250514";

/**
 * Verify a single citation against the database.
 */
async function verifySingleCitation(
  citation: Citation,
): Promise<CitationVerification> {
  if (!citation.section_id) {
    return {
      citation_id: `${citation.regulation_name}_${citation.section_number}`,
      section_id: "",
      exists_in_db: false,
      text_match_score: 0,
      url_valid: null,
      status: "not_found",
    };
  }

  const section = await getSectionById(citation.section_id);

  if (!section) {
    return {
      citation_id: citation.section_id,
      section_id: citation.section_id,
      exists_in_db: false,
      text_match_score: 0,
      url_valid: null,
      status: "not_found",
    };
  }

  const textMatchScore = computeTextMatchScore(
    citation.excerpt,
    section.content,
  );

  return {
    citation_id: citation.section_id,
    section_id: citation.section_id,
    exists_in_db: true,
    text_match_score: textMatchScore,
    url_valid: null,
    status:
      textMatchScore >= 0.7
        ? "verified"
        : textMatchScore >= 0.3
          ? "partial_match"
          : "text_mismatch",
  };
}

/**
 * Step 1: Verify all citations in parallel against the database.
 */
async function verifyCitationsInDB(
  citations: readonly Citation[],
): Promise<readonly CitationVerification[]> {
  return Promise.all(citations.map(verifySingleCitation));
}

/**
 * Compute how well the citation excerpt matches the actual regulation content.
 * Uses containment check + n-gram overlap for better matching.
 */
function computeTextMatchScore(excerpt: string, content: string): number {
  const normalizedExcerpt = excerpt.toLowerCase().trim();
  const normalizedContent = content.toLowerCase().trim();

  // Direct containment check
  if (normalizedContent.includes(normalizedExcerpt)) {
    return 1.0;
  }

  // Check if excerpt is contained within content (partial match)
  if (normalizedExcerpt.length > 20) {
    const excerptChunks = splitIntoChunks(normalizedExcerpt, 30);
    const chunkMatches = excerptChunks.filter((chunk) =>
      normalizedContent.includes(chunk),
    );
    if (chunkMatches.length > 0) {
      const chunkScore = chunkMatches.length / excerptChunks.length;
      if (chunkScore > 0.5) return 0.3 + chunkScore * 0.5;
    }
  }

  // Keyword overlap (words > 3 chars)
  const excerptWords = new Set(
    normalizedExcerpt.split(/\s+/).filter((w) => w.length > 3),
  );
  const contentWords = new Set(
    normalizedContent.split(/\s+/).filter((w) => w.length > 3),
  );

  if (excerptWords.size === 0) return 0;

  let matches = 0;
  for (const word of excerptWords) {
    if (contentWords.has(word)) matches++;
  }

  return matches / excerptWords.size;
}

/**
 * Split text into overlapping chunks for partial matching.
 */
function splitIntoChunks(text: string, chunkSize: number): readonly string[] {
  const chunks: string[] = [];
  for (let i = 0; i < text.length - chunkSize; i += chunkSize / 2) {
    chunks.push(text.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * Step 2: LLM-based answer verification.
 * A separate Claude call reviews the answer against regulation text.
 */
async function verifyWithLLM(
  question: string,
  answer: string,
  regulationContexts: readonly {
    readonly content: string;
    readonly section_number: string;
    readonly regulation_name: string;
  }[],
): Promise<LLMVerification> {
  const contextText = regulationContexts
    .map(
      (c, i) =>
        `[${i + 1}] ${c.regulation_name} (${c.section_number}):\n${c.content}`,
    )
    .join("\n\n---\n\n");

  const verificationPrompt = `
## Original Question
${question}

## Generated Answer
${answer}

## Regulation Context Used
${contextText}

Please verify the accuracy of the answer against the regulation context. Output your assessment as JSON.`;

  try {
    const { text } = await generateText({
      model: anthropic(VERIFIER_MODEL),
      system: SYSTEM_PROMPT_VERIFIER,
      prompt: verificationPrompt,
      maxOutputTokens: 2000,
      temperature: 0,
    });

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        is_accurate: parsed.is_accurate ?? false,
        accuracy_score: parsed.accuracy_score ?? 0,
        issues: (parsed.issues ?? []).map(
          (issue: Record<string, unknown>) => ({
            type: issue.type ?? "missing_nuance",
            description: issue.description ?? "",
            severity: issue.severity ?? "minor",
            suggested_correction: issue.suggested_correction,
          }),
        ),
        missing_regulations: (parsed.missing_regulations ?? []).map(
          (reg: Record<string, unknown>) => ({
            regulation_name: reg.regulation_name ?? "",
            section: reg.section ?? "",
            reason: reg.reason ?? "",
          }),
        ),
        verifier_notes: parsed.verifier_notes ?? "",
      };
    }
  } catch (error) {
    console.error("LLM verification failed:", error);
  }

  return {
    is_accurate: false,
    accuracy_score: 0,
    issues: [
      {
        type: "missing_nuance",
        description: "Verification could not be completed",
        severity: "major",
        suggested_correction: undefined,
      },
    ],
    missing_regulations: [],
    verifier_notes: "Verification pipeline encountered an error",
  };
}

/**
 * Full 3-step verification pipeline.
 * Steps 1 (citation DB check) and 2 (LLM verification) run in parallel.
 */
export async function verifyAnswer(
  question: string,
  answer: string,
  citations: readonly Citation[],
  contexts: readonly {
    readonly content: string;
    readonly section_number: string;
    readonly regulation_name: string;
  }[],
): Promise<VerificationResult> {
  const startTime = Date.now();

  // Steps 1 & 2 run in parallel for better performance
  const [citationChecks, llmVerification] = await Promise.all([
    verifyCitationsInDB(citations),
    verifyWithLLM(question, answer, contexts),
  ]);

  // Step 3: Compute confidence
  const confidence = computeConfidence(citationChecks, llmVerification);

  return {
    overall_confidence: confidence,
    citation_checks: citationChecks as CitationVerification[],
    llm_verification: llmVerification,
    total_citations: citations.length,
    verified_count: citationChecks.filter((c) => c.status === "verified")
      .length,
    flagged_count: citationChecks.filter(
      (c) => c.status === "not_found" || c.status === "text_mismatch",
    ).length,
    processing_time_ms: Date.now() - startTime,
    verified_at: new Date().toISOString(),
  };
}
