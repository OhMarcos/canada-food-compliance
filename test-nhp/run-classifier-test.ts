/**
 * Local test runner for NHP domain classifier edge cases.
 * Tests the keyword-based classifier (no API calls needed).
 *
 * Usage: npx tsx test-nhp/run-classifier-test.ts
 */

import { NHP_EDGE_CASES, type EdgeCase } from "./edge-cases";

// ---- Import the actual keyword classifier from source ----
// We use dynamic import with path alias resolution via tsx

type ProductDomain = "food" | "nhp" | "both";

interface DomainClassification {
  readonly domain: ProductDomain;
  readonly confidence: "high" | "medium" | "low";
  readonly reason: string;
}

// ---- Replicate the classifier logic inline (to avoid alias issues with tsx) ----

const NHP_KEYWORDS: readonly string[] = [
  "natural health product", "nhp", "nhps", "npn", "din-hm",
  "supplement", "supplements", "health supplement", "dietary supplement",
  "nutraceutical", "health product", "wellness product", "wellness",
  "natural remedy", "alternative medicine",
  "medicinal herb", "medicinal herbs",
  "colostrum supplement", "weight loss supplement", "powder supplement",
  "vitamin", "multivitamin", "prenatal vitamin",
  "folate", "folic acid", "biotin",
  "mineral supplement", "calcium supplement", "iron supplement",
  "magnesium supplement", "zinc supplement", "selenium supplement",
  "chromium supplement", "potassium supplement",
  "probiotic", "probiotics", "prebiotic", "prebiotics",
  "digestive enzyme", "lactase",
  "herbal", "herbal remedy", "herbal medicine",
  "ashwagandha", "echinacea", "turmeric", "ginkgo", "ginkgo biloba",
  "milk thistle", "saw palmetto", "ginseng", "red ginseng",
  "elderberry", "valerian", "chamomile", "rhodiola",
  "bacopa", "fenugreek", "curcumin", "adaptogen", "nootropic",
  "botanical extract",
  "homeopathic", "homeopathy",
  "traditional medicine", "traditional chinese medicine", "tcm", "ayurveda",
  "melatonin", "glucosamine", "chondroitin", "collagen supplement",
  "coq10", "coenzyme q10", "alpha-lipoic acid",
  "5-htp", "gaba", "nac", "resveratrol", "quercetin",
  "spirulina", "chlorella", "lutein", "lycopene",
  "fish oil", "krill oil", "flaxseed oil",
  "hyaluronic acid", "msm",
  "capsule", "capsules", "tablet", "tablets",
  "softgel", "softgels", "gummy", "gummies",
  "tincture", "lozenge", "chewable", "pills",
  "drops", "spray", "sublingual", "enteric-coated",
  "immune support", "immune booster",
  "digestive support", "digestive health",
  "joint support", "joint health", "bone health",
  "brain health", "cognitive support",
  "sleep support", "stress relief", "mood support",
  "energy support", "detox", "detoxification",
  "liver support", "anti-inflammatory",
  "weight loss supplement", "metabolism support",
  "medicinal ingredient", "non-medicinal ingredient",
  "therapeutic claim", "health claim",
  "site licence", "site license", "product licence", "product license",
  "nnhpd", "compendium", "monograph", "schedule 1",
  "adverse reaction", "canada vigilance",
  "gmp", "good manufacturing practice",
  "product facts table",
  "천연건강제품", "건강기능식품", "건강보조식품", "건강식품",
  "영양제", "보충제", "영양보충제", "기능성식품",
  "건강 보조", "건강 제품",
  "비타민", "엽산", "멜라토닌",
  "칼슘 보충제", "철분 보충제", "마그네슘 보충제",
  "아연 보충제", "셀레늄",
  "한약", "한방", "생약", "동종요법",
  "인삼", "홍삼", "당귀", "황기", "감초", "도라지",
  "울금", "강황", "약초", "민간요법",
  "프로바이오틱스", "유산균", "락토바실러스",
  "글루코사민", "콘드로이친", "콜라겐",
  "코엔자임", "루테인", "라이코펜",
  "오메가3", "오메가", "히알루론산",
  "스피루리나", "클로렐라",
  "캡슐", "정제", "알약", "젤리", "환", "과립",
  "액상", "분말", "시럽",
  "면역력", "면역증진", "장건강", "관절건강", "뼈건강",
  "피로회복", "혈행개선", "수면", "숙면",
  "해독", "디톡스", "간건강", "체중관리",
  "건강 주장", "건강 기능", "치료적 주장",
  "제품 라이선스", "시설 라이선스",
  "부작용", "부작용 보고",
  "모노그래프",
];

const FOOD_KEYWORDS: readonly string[] = [
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
  "식품 안전", "식품 라벨링", "영양 표시", "영양성분표",
  "식품 수입", "식품 수출", "식품 첨가물",
  "알레르겐", "성분표", "순중량",
  "유기농", "신규 식품",
  "가공식품", "통조림", "냉동식품",
  "스낵", "음료", "주스",
  "라벨", "유통기한", "칼로리", "식품표시",
];

const BOUNDARY_PATTERNS: readonly RegExp[] = [
  /\bfood\s+(?:or|vs|versus)\s+(?:nhp|supplement|natural health)/i,
  /\b(?:nhp|supplement)\s+(?:or|vs|versus)\s+food\b/i,
  /\bis\s+(?:it|this|my product)\s+(?:food|nhp|a supplement)/i,
  /\bclassified\s+as\b/i,
  /\bcategorized\s+as\b/i,
  /\bsell\b.*\bas\s+food\b.*(?:supplement|vitamin|capsule|health claim|therapeutic)/i,
  /\bwithout\s+(?:npn|product\s+licen[cs]e)\b/i,
  /식품인가.*(?:nhp|보충제|건강기능식품)/i,
  /(?:nhp|보충제|건강기능식품)인가.*식품/i,
  /식품과\s*(?:nhp|건강기능식품)/i,
  /식품\s*(?:또는|아니면)\s*(?:nhp|보충제|건강기능식품)/i,
  /(?:어떤|무슨)\s*(?:분류|카테고리|규제)/i,
  /(?:식품|nhp)으?로\s*분류/i,
  /\bfunctional\s+food\b/i,
  /\bfortified\b/i,
  /\benriched\b/i,
  /\bsupplemented\s+food\b/i,
  /\bmeal\s+replacement\b/i,
  /\bsports\s+nutrition\b/i,
  /\bfood[- ]nhp\s+(?:boundary|interface|distinction)\b/i,
];

function buildKeywordRegexes(keywords: readonly string[]): readonly RegExp[] {
  return keywords.map((kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const hasKorean = /[가-힣]/.test(kw);
    if (hasKorean) return new RegExp(escaped, "i");
    return new RegExp(`\\b${escaped}\\b`, "i");
  });
}

const NHP_REGEXES = buildKeywordRegexes(NHP_KEYWORDS);
const FOOD_REGEXES = buildKeywordRegexes(FOOD_KEYWORDS);

function countMatches(text: string, regexes: readonly RegExp[]): number {
  return regexes.filter((rx) => rx.test(text)).length;
}

function keywordClassify(query: string): DomainClassification {
  const lower = query.toLowerCase();

  for (const pattern of BOUNDARY_PATTERNS) {
    if (pattern.test(lower)) {
      return { domain: "both", confidence: "high", reason: "Boundary comparison pattern detected" };
    }
  }

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

  return { domain: "food", confidence: "low", reason: "No strong domain signals; defaulting to food" };
}

// ---- Test Runner ----

interface TestResult {
  readonly edgeCase: EdgeCase;
  readonly actual: DomainClassification;
  readonly pass: boolean;
  readonly partialPass: boolean;
}

function isAcceptable(expected: ProductDomain, actual: ProductDomain): boolean {
  if (expected === actual) return true;
  if (actual === "both" && (expected === "nhp" || expected === "food")) return true;
  if (expected === "both" && (actual === "nhp" || actual === "food")) return true;
  return false;
}

function runTests(): void {
  const results: TestResult[] = [];
  let pass = 0;
  let partialPass = 0;
  let fail = 0;

  for (const ec of NHP_EDGE_CASES) {
    const actual = keywordClassify(ec.query);
    const exactPass = actual.domain === ec.expectedDomain;
    const acceptable = isAcceptable(ec.expectedDomain, actual.domain);

    results.push({ edgeCase: ec, actual, pass: exactPass, partialPass: acceptable && !exactPass });

    if (exactPass) pass++;
    else if (acceptable) partialPass++;
    else fail++;
  }

  console.log("\n" + "=".repeat(80));
  console.log("NHP EDGE CASE TEST RESULTS — Keyword Classifier (v2: expanded + boundary)");
  console.log("=".repeat(80));
  console.log(`Total: ${NHP_EDGE_CASES.length}`);
  console.log(`  ✓ Exact match:   ${pass} (${(pass / NHP_EDGE_CASES.length * 100).toFixed(1)}%)`);
  console.log(`  ~ Acceptable:    ${partialPass} (${(partialPass / NHP_EDGE_CASES.length * 100).toFixed(1)}%)`);
  console.log(`  ✗ Failed:        ${fail} (${(fail / NHP_EDGE_CASES.length * 100).toFixed(1)}%)`);
  console.log(`  Combined pass:   ${pass + partialPass} (${((pass + partialPass) / NHP_EDGE_CASES.length * 100).toFixed(1)}%)`);

  const categories = [...new Set(NHP_EDGE_CASES.map(ec => ec.category))];
  console.log("\n" + "-".repeat(60));
  console.log("Results by Category:");
  for (const cat of categories) {
    const catResults = results.filter(r => r.edgeCase.category === cat);
    const catPass = catResults.filter(r => r.pass).length;
    const catAcceptable = catResults.filter(r => r.partialPass).length;
    const catFail = catResults.filter(r => !r.pass && !r.partialPass).length;
    const total = catResults.length;
    console.log(`  ${cat.padEnd(20)} ${total} cases — ✓${catPass} ~${catAcceptable} ✗${catFail} (${((catPass + catAcceptable) / total * 100).toFixed(0)}% acceptable)`);
  }

  console.log("\n" + "-".repeat(60));
  console.log("Results by Difficulty:");
  for (const diff of ["easy", "medium", "hard"] as const) {
    const diffResults = results.filter(r => r.edgeCase.difficulty === diff);
    const diffPass = diffResults.filter(r => r.pass).length;
    const diffAcceptable = diffResults.filter(r => r.partialPass).length;
    const diffFail = diffResults.filter(r => !r.pass && !r.partialPass).length;
    const total = diffResults.length;
    if (total > 0) {
      console.log(`  ${diff.padEnd(10)} ${total} cases — ✓${diffPass} ~${diffAcceptable} ✗${diffFail} (${((diffPass + diffAcceptable) / total * 100).toFixed(0)}% acceptable)`);
    }
  }

  const failures = results.filter(r => !r.pass && !r.partialPass);
  if (failures.length > 0) {
    console.log("\n" + "-".repeat(60));
    console.log(`FAILED CASES (${failures.length}):`);
    for (const f of failures) {
      console.log(`\n  #${f.edgeCase.id} [${f.edgeCase.category}/${f.edgeCase.difficulty}]`);
      console.log(`  Query: "${f.edgeCase.query.slice(0, 80)}${f.edgeCase.query.length > 80 ? "..." : ""}"`);
      console.log(`  Expected: ${f.edgeCase.expectedDomain} → Got: ${f.actual.domain} (${f.actual.confidence})`);
      console.log(`  Reason: ${f.actual.reason}`);
      if (f.edgeCase.notes) console.log(`  Notes: ${f.edgeCase.notes}`);
    }
  }

  const partials = results.filter(r => r.partialPass);
  if (partials.length > 0) {
    console.log("\n" + "-".repeat(60));
    console.log(`PARTIAL PASS (${partials.length}):`);
    for (const p of partials) {
      console.log(`  #${p.edgeCase.id} Expected: ${p.edgeCase.expectedDomain} → Got: ${p.actual.domain} — "${p.edgeCase.query.slice(0, 60)}..."`);
    }
  }

  const lowConf = results.filter(r => r.pass && r.actual.confidence === "low");
  if (lowConf.length > 0) {
    console.log("\n" + "-".repeat(60));
    console.log(`LOW CONFIDENCE (${lowConf.length}):`);
    for (const l of lowConf) {
      console.log(`  #${l.edgeCase.id} ${l.actual.domain} — "${l.edgeCase.query.slice(0, 60)}..."`);
    }
  }

  console.log("\n" + "=".repeat(80));
}

runTests();
