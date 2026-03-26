/**
 * Regulation Router — identifies which Canadian regulations are relevant to a query.
 * Uses Claude Haiku for fast, cheap routing decisions.
 * Queries the regulations table for metadata, then asks the LLM to pick the best matches.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getSupabaseClient } from "@/lib/db/client";
import { TimeBasedCache } from "@/lib/cache";

const ROUTER_MODEL = "claude-haiku-4-5-20251001";

export interface RegulationRoute {
  readonly short_name: string;
  readonly title_en: string;
  readonly official_url: string;
  readonly reason: string;
}

interface RegulationMeta {
  readonly short_name: string;
  readonly title_en: string;
  readonly official_url: string;
  readonly applies_to: readonly string[];
  readonly statute_type: string;
  readonly product_domain: string;
}

/** Cache for the regulation list (rarely changes) */
const regListCache = new TimeBasedCache<readonly RegulationMeta[]>({
  ttlMs: 30 * 60 * 1000, // 30 minutes
  maxEntries: 1,
});

/**
 * Load all active regulations from the database.
 */
async function loadRegulations(): Promise<readonly RegulationMeta[]> {
  const cached = regListCache.get("all");
  if (cached) return cached;

  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("regulations")
    .select("short_name, title_en, official_url, applies_to, statute_type, product_domain")
    .eq("is_active", true)
    .order("title_en");

  if (error || !data) {
    console.error("Failed to load regulations for routing:", error);
    return [];
  }

  const results = data.map((r: Record<string, unknown>) => ({
    short_name: r.short_name as string,
    title_en: r.title_en as string,
    official_url: r.official_url as string,
    applies_to: r.applies_to as string[],
    statute_type: r.statute_type as string,
    product_domain: (r.product_domain as string) ?? "food",
  }));

  regListCache.set("all", results);
  return results;
}

/**
 * Route a user query to the most relevant regulations.
 * Returns 1-3 regulations with their official URLs and reasons.
 * Returns empty array on failure (never throws).
 */
export async function routeQuery(query: string): Promise<readonly RegulationRoute[]> {
  try {
    const regulations = await loadRegulations();
    if (regulations.length === 0) return [];

    const regList = regulations
      .map((r) => `- ${r.short_name}: ${r.title_en} [${r.statute_type}] [domain: ${r.product_domain}] (topics: ${r.applies_to.join(", ")})`)
      .join("\n");

    console.log(`[router] Loaded ${regulations.length} regulations, routing query: "${query.slice(0, 80)}"`);

    const { text } = await generateText({
      model: anthropic(ROUTER_MODEL),
      system: `You are a Canadian regulatory routing assistant for both Food and Natural Health Product (NHP) regulations. Given a user question and a list of available regulations, identify which 1-3 regulations are most likely to contain the answer.

Each regulation has a domain tag: [domain: food], [domain: nhp], or [domain: both].
- Food questions → prefer food/both domain regulations
- NHP/supplement questions → prefer nhp/both domain regulations
- Questions spanning both → include regulations from both domains

Output ONLY a JSON array. Each item must have: short_name, reason (brief, 1 sentence).

Example output:
[{"short_name": "SFCR", "reason": "Covers food labeling requirements for all products sold in Canada"}]

IMPORTANT: Always pick at least 1 regulation. Only output an empty array if the question is completely unrelated to food or health products.`,
      prompt: `Question: ${query}

Available regulations:
${regList}`,
      maxOutputTokens: 300,
      temperature: 0,
    });

    console.log(`[router] Haiku raw response: ${text.slice(0, 500)}`);

    // Strip markdown code fences if present
    const cleanText = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleanText);
    if (!Array.isArray(parsed)) {
      console.warn("[router] Haiku returned non-array:", typeof parsed);
      return [];
    }

    // Map back to full regulation data
    const regMap = new Map(regulations.map((r) => [r.short_name, r]));

    const matched = parsed
      .filter((item: { short_name?: string }) => {
        if (!item.short_name) return false;
        if (!regMap.has(item.short_name)) {
          console.warn(`[router] Haiku returned unknown short_name: "${item.short_name}"`);
          return false;
        }
        return true;
      })
      .slice(0, 3)
      .map((item: { short_name: string; reason?: string }) => {
        const reg = regMap.get(item.short_name)!;
        return {
          short_name: reg.short_name,
          title_en: reg.title_en,
          official_url: reg.official_url,
          reason: item.reason ?? "",
        };
      });

    console.log(`[router] Matched ${matched.length} regulation(s): ${matched.map((m: RegulationRoute) => m.short_name).join(", ")}`);
    return matched;
  } catch (error) {
    console.warn("[router] Regulation routing failed:", error instanceof Error ? `${error.name}: ${error.message}` : error);
    return [];
  }
}
