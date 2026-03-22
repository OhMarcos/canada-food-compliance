/**
 * RAG-based compliance checker for imported food products.
 * Retrieves relevant Canadian regulations and assesses product compliance.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { SYSTEM_PROMPT_COMPLIANCE } from "./product-check-prompts";
import { safeParseJson } from "./json-parser";
import { retrieveContext, type RetrievedContext } from "@/lib/rag/retriever";
import { ComplianceReportSchema, type ComplianceReport, type ExtractedProductInfo } from "@/types/product-check";

const MODEL = "claude-sonnet-4-20250514";

interface ComplianceResult {
  readonly report: ComplianceReport;
  readonly contexts: readonly RetrievedContext[];
}

/**
 * Check product compliance against Canadian food regulations.
 * Runs multiple RAG queries in parallel to cover different regulatory areas.
 */
export async function checkCompliance(
  productInfo: ExtractedProductInfo,
): Promise<ComplianceResult> {
  // Build targeted RAG queries from product info
  const queries = buildComplianceQueries(productInfo);

  // Run all queries in parallel
  const contextArrays = await Promise.all(
    queries.map((q) =>
      retrieveContext(q, { limit: 8 }),
    ),
  );

  // Deduplicate by section_id
  const seen = new Set<string>();
  const contexts: RetrievedContext[] = [];
  for (const arr of contextArrays) {
    for (const ctx of arr) {
      if (!seen.has(ctx.section_id)) {
        seen.add(ctx.section_id);
        contexts.push(ctx);
      }
    }
  }

  // Sort by score descending, take top 15 (immutable sort)
  const topContexts = [...contexts]
    .sort((a, b) => b.score - a.score)
    .slice(0, 15);

  // Build prompt with regulatory context
  const contextText = topContexts
    .map(
      (c, i) =>
        `[${i + 1}] **${c.regulation_name} (${c.regulation_short_name})** — ${c.section_number}\nURL: ${c.section_url ?? c.official_url}\n${c.content}\n`,
    )
    .join("\n---\n\n");

  const systemPrompt = SYSTEM_PROMPT_COMPLIANCE + contextText;

  const productSummary = buildProductSummary(productInfo);

  const { text } = await generateText({
    model: anthropic(MODEL),
    system: systemPrompt,
    messages: [
      {
        role: "user",
        content: `Assess the following product for Canadian import compliance:\n\n${productSummary}`,
      },
    ],
    maxOutputTokens: 6000,
    temperature: 0.1,
  });

  const parsed = safeParseJson(text);
  if (parsed === null) {
    const fallback: ComplianceReport = {
      feasibility: "conditional",
      summary: "Unable to parse compliance assessment. Please try again.",
      items: [],
      action_items: [],
    };
    return { report: fallback, contexts: topContexts };
  }

  const result = ComplianceReportSchema.safeParse(parsed);
  if (result.success) {
    return { report: result.data, contexts: topContexts };
  }

  // Apply defaults for robustness
  const raw = parsed as Record<string, unknown>;
  const withDefaults = {
    feasibility: raw.feasibility ?? "conditional",
    summary: raw.summary ?? "Compliance assessment completed with partial results.",
    items: Array.isArray(raw.items)
      ? raw.items.map((item: Record<string, unknown>) => ({
          category: item.category ?? "other",
          requirement: item.requirement ?? "Unknown",
          status: item.status ?? "unknown",
          regulation_reference: item.regulation_reference ?? "",
          description: item.description ?? "",
          action_required: item.action_required ?? undefined,
        }))
      : [],
    action_items: Array.isArray(raw.action_items)
      ? raw.action_items.map((a: Record<string, unknown>) => ({
          priority: a.priority ?? "medium",
          action: a.action ?? "",
          category: a.category ?? "other",
        }))
      : [],
  };
  return { report: ComplianceReportSchema.parse(withDefaults), contexts: topContexts };
}

/**
 * Build RAG search queries covering different regulatory angles.
 */
function buildComplianceQueries(info: ExtractedProductInfo): readonly string[] {
  const queries: string[] = [];

  // General import requirements
  queries.push("Canada food import licence SFC requirements preventive control plan");

  // Labelling requirements
  queries.push("Canada food labelling bilingual English French requirements CPLA");

  // Ingredients & additives
  if (info.ingredients_translated.length > 0) {
    const topIngredients = info.ingredients_translated.slice(0, 5).join(", ");
    queries.push(`Canada food additives permitted ingredients ${topIngredients}`);
  }

  // Allergens
  if (info.allergens.length > 0) {
    const topAllergens = info.allergens.slice(0, 5).join(", ");
    queries.push(`Canada priority allergen declaration requirements ${topAllergens}`);
  }

  // Nutrition facts
  queries.push("Canada nutrition facts table format requirements FDR");

  // Category-specific
  if (info.product_category) {
    queries.push(`Canada ${info.product_category} food regulations requirements`);
  }

  return queries;
}

/**
 * Build a human-readable product summary for the compliance prompt.
 */
function buildProductSummary(info: ExtractedProductInfo): string {
  const lines: string[] = [
    `**Product Name:** ${info.product_name_translated} (${info.product_name})`,
    `**Category:** ${info.product_category}`,
    `**Origin Country:** ${info.origin_country}`,
    `**Manufacturer:** ${info.manufacturer}`,
    `**Net Weight:** ${info.net_weight}`,
    `**Original Label Language:** ${info.original_language}`,
    "",
    `**Ingredients (translated):** ${info.ingredients_translated.join(", ") || "Not available"}`,
    "",
    `**Declared Allergens:** ${info.allergens.join(", ") || "None declared"}`,
    "",
    `**Health Claims:** ${info.health_claims.join("; ") || "None"}`,
    `**Certifications:** ${info.certifications.join(", ") || "None"}`,
  ];

  if (info.nutrition_facts) {
    lines.push("");
    lines.push("**Nutrition Facts:**");
    if (info.nutrition_facts.serving_size) lines.push(`  Serving size: ${info.nutrition_facts.serving_size}`);
    if (info.nutrition_facts.calories) lines.push(`  Calories: ${info.nutrition_facts.calories}`);
    if (info.nutrition_facts.total_fat) lines.push(`  Total Fat: ${info.nutrition_facts.total_fat}`);
    if (info.nutrition_facts.sodium) lines.push(`  Sodium: ${info.nutrition_facts.sodium}`);
    if (info.nutrition_facts.total_carbohydrate) lines.push(`  Carbohydrates: ${info.nutrition_facts.total_carbohydrate}`);
    if (info.nutrition_facts.protein) lines.push(`  Protein: ${info.nutrition_facts.protein}`);
  }

  if (info.storage_instructions) {
    lines.push(`\n**Storage:** ${info.storage_instructions}`);
  }

  if (info.additional_notes) {
    lines.push(`\n**Notes:** ${info.additional_notes}`);
  }

  return lines.join("\n");
}

