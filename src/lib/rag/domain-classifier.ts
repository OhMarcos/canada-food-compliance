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

// ============================================
// KEYWORD LISTS
// ============================================

/**
 * NHP-related keywords for keyword-based fallback classification.
 * All matching uses word-boundary regex (\b) to avoid false positives.
 * Ambiguous ingredient names (calcium, iron, etc.) use compound forms only.
 */
const NHP_KEYWORDS: readonly string[] = [
  // --- Product category ---
  "natural health product", "nhp", "nhps", "npn", "din-hm",
  "supplement", "supplements", "health supplement", "dietary supplement",
  "nutraceutical", "health product", "wellness product", "wellness",
  "natural remedy", "alternative medicine",
  "medicinal herb", "medicinal herbs",
  "colostrum supplement", "weight loss supplement", "powder supplement",
  // --- Vitamins ---
  "vitamin", "multivitamin", "prenatal vitamin",
  "folate", "folic acid", "biotin",
  // --- Minerals (compound form to avoid food collision) ---
  "mineral supplement", "calcium supplement", "iron supplement",
  "magnesium supplement", "zinc supplement", "selenium supplement",
  "chromium supplement", "potassium supplement",
  // --- Probiotics ---
  "probiotic", "probiotics", "prebiotic", "prebiotics",
  "digestive enzyme", "lactase",
  // --- Herbal / Botanical ---
  "herbal", "herbal remedy", "herbal medicine",
  "ashwagandha", "echinacea", "turmeric", "ginkgo", "ginkgo biloba",
  "milk thistle", "saw palmetto", "ginseng", "red ginseng",
  "elderberry", "valerian", "chamomile", "rhodiola",
  "bacopa", "fenugreek", "curcumin", "adaptogen", "nootropic",
  "botanical extract",
  // --- Traditional medicine ---
  "homeopathic", "homeopathy",
  "traditional medicine", "traditional chinese medicine", "tcm", "ayurveda",
  // --- Specific ingredients ---
  "melatonin", "glucosamine", "chondroitin", "collagen supplement",
  "coq10", "coenzyme q10", "alpha-lipoic acid",
  "5-htp", "gaba", "nac", "resveratrol", "quercetin",
  "spirulina", "chlorella", "lutein", "lycopene",
  "fish oil", "krill oil", "flaxseed oil",
  "hyaluronic acid", "msm",
  // --- Dosage forms ---
  "capsule", "capsules", "tablet", "tablets",
  "softgel", "softgels", "gummy", "gummies",
  "tincture", "lozenge", "chewable", "pills",
  "drops", "spray", "sublingual", "enteric-coated",
  // --- Health claims / benefits ---
  "immune support", "immune booster",
  "digestive support", "digestive health",
  "joint support", "joint health", "bone health",
  "brain health", "cognitive support",
  "sleep support", "stress relief", "mood support",
  "energy support", "detox", "detoxification",
  "liver support", "anti-inflammatory",
  "weight loss supplement", "metabolism support",
  // --- Regulatory terms ---
  "medicinal ingredient", "non-medicinal ingredient",
  "therapeutic claim", "health claim",
  "site licence", "site license", "product licence", "product license",
  "nnhpd", "compendium", "monograph", "schedule 1",
  "adverse reaction", "canada vigilance",
  "gmp", "good manufacturing practice",
  "product facts table",
  // --- Korean: general ---
  "천연건강제품", "건강기능식품", "건강보조식품", "건강식품",
  "영양제", "보충제", "영양보충제", "기능성식품",
  "건강 보조", "건강 제품",
  // --- Korean: vitamins/minerals ---
  "비타민", "엽산", "멜라토닌",
  "칼슘 보충제", "철분 보충제", "마그네슘 보충제",
  "아연 보충제", "셀레늄",
  // --- Korean: herbs / traditional ---
  "한약", "한방", "생약", "동종요법",
  "인삼", "홍삼", "당귀", "황기", "감초", "도라지",
  "울금", "강황", "약초", "민간요법",
  // --- Korean: specific ingredients ---
  "프로바이오틱스", "유산균", "락토바실러스",
  "글루코사민", "콘드로이친", "콜라겐",
  "코엔자임", "루테인", "라이코펜",
  "오메가3", "오메가", "히알루론산",
  "스피루리나", "클로렐라",
  // --- Korean: dosage forms ---
  "캡슐", "정제", "알약", "젤리", "환", "과립",
  "액상", "분말", "시럽",
  // --- Korean: health benefits ---
  "면역력", "면역증진", "장건강", "관절건강", "뼈건강",
  "피로회복", "혈행개선", "수면", "숙면",
  "해독", "디톡스", "간건강", "체중관리",
  // --- Korean: regulatory ---
  "건강 주장", "건강 기능", "치료적 주장",
  "제품 라이선스", "시설 라이선스",
  "부작용", "부작용 보고",
  "모노그래프",
];

const FOOD_KEYWORDS: readonly string[] = [
  // --- English ---
  "food safety", "food labeling", "food labelling", "nutrition facts",
  "sfca", "sfcr", "cfia", "food inspection",
  "food import", "food export", "food additive",
  "allergen", "ingredient list", "net quantity",
  "organic food", "novel food",
  "haccp", "preventive control", "pcp",
  "meat", "dairy", "poultry", "seafood", "bakery",
  "processed food", "canned food", "frozen food",
  "snack", "beverage", "juice", "cereal",
  "safe food for canadians",
  "food recall", "food grade",
  "ingredients list", "nutritional", "calorie",
  "labelling", "best before",
  // --- Korean ---
  "식품 안전", "식품 라벨링", "영양 표시", "영양성분표",
  "식품 수입", "식품 수출", "식품 첨가물",
  "알레르겐", "성분표", "순중량",
  "유기농", "신규 식품",
  "가공식품", "통조림", "냉동식품",
  "스낵", "음료", "주스",
  "라벨", "유통기한", "칼로리", "식품표시",
];

// ============================================
// BOUNDARY PATTERNS — detect "food or NHP?" comparison queries
// ============================================

const BOUNDARY_PATTERNS: readonly RegExp[] = [
  // Direct comparison: "food or NHP", "food vs NHP"
  /\bfood\s+(?:or|vs|versus)\s+(?:nhp|supplement|natural health)/i,
  /\b(?:nhp|supplement)\s+(?:or|vs|versus)\s+food\b/i,
  // Classification inquiry: "is it food or NHP", "classified as"
  /\bis\s+(?:it|this|my product)\s+(?:food|nhp|a supplement)/i,
  /\bclassified\s+as\b/i,
  /\bcategorized\s+as\b/i,
  // "Can I sell X as food" with NHP signals
  /\bsell\b.*\bas\s+food\b.*(?:supplement|vitamin|capsule|health claim|therapeutic)/i,
  /\bwithout\s+(?:npn|product\s+licen[cs]e)\b/i,
  // Korean comparison patterns
  /식품인가.*(?:nhp|보충제|건강기능식품)/i,
  /(?:nhp|보충제|건강기능식품)인가.*식품/i,
  /식품과\s*(?:nhp|건강기능식품)/i,
  /식품\s*(?:또는|아니면)\s*(?:nhp|보충제|건강기능식품)/i,
  // Korean classification inquiry
  /(?:어떤|무슨)\s*(?:분류|카테고리|규제)/i,
  /(?:식품|nhp)으?로\s*분류/i,
  // Boundary product patterns
  /\bfunctional\s+food\b/i,
  /\bfortified\b/i,
  /\benriched\b/i,
  /\bsupplemented\s+food\b/i,
  /\bmeal\s+replacement\b/i,
  /\bsports\s+nutrition\b/i,
  /\bfood[- ]nhp\s+(?:boundary|interface|distinction)\b/i,
  // Edge case: selling without NPN, pending licence
  /\b(?:sell|selling|sold)\b.*\b(?:without|before|pending)\b.*\b(?:npn|licen[cs]e|approval)\b/i,
  /npn.*(?:신청|심사|대기|pending)/i,
  // Edge case: private label / contract manufacturing
  /\bprivate\s+label\b/i,
  /\bcontract\s+manufactur/i,
  /\bwhite\s+label\b/i,
  /위탁.*제조|OEM/i,
  // Edge case: cross-border e-commerce
  /\b(?:online|e-?commerce|cross.?border)\b.*\b(?:nhp|supplement|sell|canada)\b/i,
  /해외.*직접.*판매|직구.*nhp|온라인.*판매.*캐나다/i,
  // Edge case: probiotic beverages, collagen drinks
  /\bprobiotic\s+(?:drink|beverage|water|juice)\b/i,
  /\bcollagen\s+(?:drink|beverage|water)\b/i,
  /프로바이오틱스?\s*음료|콜라겐\s*음료/i,
  // Edge case: CBD / cannabis
  /\bcbd\b/i,
  /\bcannabis\b/i,
  /\bhemp\s+(?:extract|oil)\b/i,
];

// ============================================
// KEYWORD MATCHING (word-boundary regex)
// ============================================

/** Pre-compile keyword regexes for performance */
function buildKeywordRegexes(keywords: readonly string[]): readonly RegExp[] {
  return keywords.map((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    // Korean characters don't support \b — use lookaround for non-Korean boundaries
    const hasKorean = /[가-힣]/.test(kw);
    if (hasKorean) {
      // For Korean: match if keyword appears (Korean word boundaries are inherently whitespace-based)
      return new RegExp(escaped, "i");
    }
    return new RegExp(`\\b${escaped}\\b`, "i");
  });
}

const NHP_REGEXES = buildKeywordRegexes(NHP_KEYWORDS);
const FOOD_REGEXES = buildKeywordRegexes(FOOD_KEYWORDS);

function countMatches(text: string, regexes: readonly RegExp[]): number {
  return regexes.filter((rx) => rx.test(text)).length;
}

// ============================================
// CLASSIFICATION LOGIC
// ============================================

/**
 * Fast keyword-based classification (fallback when LLM unavailable).
 * Priority: boundary patterns → keyword scores → default food.
 */
function keywordClassify(query: string): DomainClassification {
  const lower = query.toLowerCase();

  // 1. Boundary pattern check (highest priority)
  for (const pattern of BOUNDARY_PATTERNS) {
    if (pattern.test(lower)) {
      return { domain: "both", confidence: "high", reason: "Boundary comparison pattern detected" };
    }
  }

  // 2. Keyword scoring
  const nhpScore = countMatches(lower, NHP_REGEXES);
  const foodScore = countMatches(lower, FOOD_REGEXES);

  if (nhpScore > 0 && foodScore > 0) {
    return { domain: "both", confidence: "medium", reason: `Matched ${nhpScore} NHP + ${foodScore} food keyword(s)` };
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
