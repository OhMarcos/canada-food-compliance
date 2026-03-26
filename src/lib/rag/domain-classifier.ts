/**
 * Domain Classifier — routes user queries to the correct product domain.
 *
 * Canada legally distinguishes Food (CFIA/SFCA) from Natural Health Products
 * (Health Canada NNHPD/NHPR). The primary boundary is the presence of
 * therapeutic health claims.
 *
 * Uses a lightweight LLM call (Claude Haiku) for accurate classification,
 * with keyword-based fallback when the LLM is unavailable.
 */

import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { TimeBasedCache } from "@/lib/cache";

export type ProductDomain = "food" | "nhp" | "both";

export interface DomainClassification {
  readonly domain: ProductDomain;
  readonly confidence: "high" | "medium" | "low";
  readonly reason: string;
}

const CLASSIFIER_MODEL = "claude-haiku-4-5-20251001";

/** Cache classifications for repeated/similar queries */
const classificationCache = new TimeBasedCache<DomainClassification>({
  ttlMs: 10 * 60 * 1000, // 10 minutes
  maxEntries: 200,
});

/**
 * NHP-related keywords for fast keyword-based fallback classification.
 */
const NHP_KEYWORDS = [
  // English
  "natural health product", "nhp", "npn", "din-hm",
  "supplement", "health supplement", "dietary supplement",
  "vitamin", "mineral supplement", "probiotic",
  "herbal", "herbal remedy", "herbal medicine",
  "homeopathic", "homeopathy",
  "traditional medicine", "traditional chinese medicine", "tcm", "ayurveda",
  "medicinal ingredient", "therapeutic claim", "health claim",
  "site licence", "site license", "product licence", "product license",
  "nnhpd", "compendium", "monograph",
  "adverse reaction", "canada vigilance",
  "gmp", "good manufacturing practice",
  "product facts table",
  // Korean
  "천연건강제품", "건강기능식품", "건강보조식품", "건강식품",
  "비타민", "미네랄", "프로바이오틱스",
  "한약", "한방", "생약", "동종요법",
  "건강 주장", "건강 기능", "치료적 주장",
  "제품 라이선스", "시설 라이선스",
  "부작용", "부작용 보고",
  "모노그래프",
] as const;

const FOOD_KEYWORDS = [
  // English
  "food safety", "food labeling", "food labelling", "nutrition facts",
  "sfca", "sfcr", "cfia", "food inspection",
  "food import", "food export", "food additive",
  "allergen", "ingredient list", "net quantity",
  "organic food", "novel food",
  "haccp", "preventive control", "pcp",
  "meat", "dairy", "poultry", "seafood", "bakery",
  "processed food", "canned food", "frozen food",
  "snack", "beverage", "juice", "cereal",
  // Korean
  "식품 안전", "식품 라벨링", "영양 표시", "영양성분표",
  "식품 수입", "식품 수출", "식품 첨가물",
  "알레르겐", "성분표", "순중량",
  "유기농", "신규 식품",
  "가공식품", "통조림", "냉동식품",
  "스낵", "음료", "주스",
] as const;

/**
 * Fast keyword-based classification (fallback when LLM unavailable).
 */
function keywordClassify(query: string): DomainClassification {
  const lower = query.toLowerCase();

  const nhpScore = NHP_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const foodScore = FOOD_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (nhpScore > 0 && foodScore > 0) {
    return { domain: "both", confidence: "medium", reason: "Query contains both food and NHP keywords" };
  }
  if (nhpScore > 0) {
    return { domain: "nhp", confidence: nhpScore >= 2 ? "high" : "medium", reason: `Matched ${nhpScore} NHP keyword(s)` };
  }
  if (foodScore > 0) {
    return { domain: "food", confidence: foodScore >= 2 ? "high" : "medium", reason: `Matched ${foodScore} food keyword(s)` };
  }

  // Default to food (original platform focus) with low confidence
  return { domain: "food", confidence: "low", reason: "No strong domain signals; defaulting to food" };
}

/**
 * LLM-based domain classification using Claude Haiku.
 * Returns null on failure so caller can fall back to keyword classification.
 */
async function llmClassify(query: string): Promise<DomainClassification | null> {
  try {
    const { text } = await generateText({
      model: anthropic(CLASSIFIER_MODEL),
      system: `You classify user queries about Canadian product regulations into one of three domains.

DOMAIN DEFINITIONS:
- "food": Questions about food products regulated under SFCA/SFCR by CFIA. Includes food labeling, nutrition facts, food import/export, food additives, food safety, HACCP, allergens.
- "nhp": Questions about Natural Health Products regulated under NHPR (SOR/2003-196) by Health Canada NNHPD. Includes supplements, vitamins, minerals, herbal products, probiotics, homeopathic medicines, traditional medicines, NPN licensing, NHP GMP, NHP labelling (Product Facts table), health claims, adverse reaction reporting.
- "both": Questions that span both domains, such as Food-NHP boundary classification, products that could be either food or NHP, questions about both regulatory systems.

KEY DISTINCTION: The presence of THERAPEUTIC health claims is the primary legal boundary. Food with therapeutic claims = NHP. NHP without therapeutic claims might be food.

Output ONLY a JSON object: {"domain": "food"|"nhp"|"both", "confidence": "high"|"medium"|"low", "reason": "brief reason"}`,
      prompt: query,
      maxOutputTokens: 150,
      temperature: 0,
    });

    const cleanText = text.trim().replace(/^```(?:json)?\s*/, "").replace(/\s*```$/, "");
    const parsed = JSON.parse(cleanText);

    if (parsed.domain && ["food", "nhp", "both"].includes(parsed.domain)) {
      return {
        domain: parsed.domain as ProductDomain,
        confidence: parsed.confidence ?? "medium",
        reason: parsed.reason ?? "",
      };
    }
  } catch (error) {
    console.warn("[domain-classifier] LLM classification failed:", error instanceof Error ? error.message : error);
  }
  return null;
}

/**
 * Classify a user query into a product domain (food, nhp, or both).
 * Uses LLM with keyword fallback. Results are cached.
 */
export async function classifyDomain(query: string): Promise<DomainClassification> {
  // Check cache
  const cacheKey = query.toLowerCase().trim().slice(0, 200);
  const cached = classificationCache.get(cacheKey);
  if (cached) return cached;

  // Try LLM classification first
  const llmResult = await llmClassify(query);
  const result = llmResult ?? keywordClassify(query);

  console.log(`[domain-classifier] "${query.slice(0, 60)}..." → ${result.domain} (${result.confidence}): ${result.reason}`);

  // Cache result
  classificationCache.set(cacheKey, result);
  return result;
}

/** Export for testing */
export { keywordClassify, classificationCache };
