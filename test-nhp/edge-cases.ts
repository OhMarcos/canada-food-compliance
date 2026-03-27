/**
 * 200 NHP Edge Cases for domain classifier testing.
 * Organized by category to cover diverse scenarios.
 *
 * Expected domains: "food" | "nhp" | "both"
 */

export interface EdgeCase {
  readonly id: number;
  readonly query: string;
  readonly expectedDomain: "food" | "nhp" | "both";
  readonly category: string;
  readonly difficulty: "easy" | "medium" | "hard";
  readonly notes?: string;
}

export const NHP_EDGE_CASES: readonly EdgeCase[] = [
  // ============================================
  // CATEGORY 1: Clear NHP (easy) — 20 cases
  // ============================================
  { id: 1, query: "What is the NPN licensing process for a new vitamin D supplement?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 2, query: "비타민 C 보충제를 캐나다에서 판매하려면 어떤 라이선스가 필요한가요?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 3, query: "How do I apply for a Natural Health Product Number (NPN)?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 4, query: "What are the GMP requirements for NHP manufacturing facilities?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 5, query: "프로바이오틱스 제조를 위한 시설 라이선스 요건은?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 6, query: "What must be included in a Product Facts table for NHPs?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 7, query: "How do I report an adverse reaction to a natural health product?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 8, query: "천연건강제품 부작용 보고 절차가 어떻게 되나요?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 9, query: "What are the NHPR requirements for herbal remedy labels?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 10, query: "Can I import homeopathic medicines into Canada without a site licence?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 11, query: "What is the compendium of monographs for NHPs?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 12, query: "NNHPD에 제품 라이선스 신청하는 방법이 궁금합니다", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 13, query: "What are the labelling requirements for a DIN-HM product?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 14, query: "미네랄 보충제의 건강 주장 기준이 무엇인가요?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 15, query: "How does the NHP site licensing inspection work?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 16, query: "What evidence do I need for NHP health claims under the NHPR?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 17, query: "한약 제품의 캐나다 수입 요건은?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 18, query: "What is Schedule 1 of the NHPR and what products does it cover?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 19, query: "How do I make a fundamental change to an existing NPN product?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },
  { id: 20, query: "NHP GMP 가이드(GUI-0158) 주요 요건이 뭔가요?", expectedDomain: "nhp", category: "clear-nhp", difficulty: "easy" },

  // ============================================
  // CATEGORY 2: Clear Food (easy) — 20 cases
  // ============================================
  { id: 21, query: "What are the SFCR requirements for importing canned vegetables?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 22, query: "캐나다에서 냉동식품 라벨에 영양성분표를 어떻게 표시해야 하나요?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 23, query: "How do I get a CFIA import licence for seafood?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 24, query: "What allergens must be declared on food labels in Canada?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 25, query: "식품 라벨의 순중량 표기 규정이 어떻게 되나요?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 26, query: "What is a Preventive Control Plan (PCP) for food manufacturing?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 27, query: "Do I need HACCP certification to export dairy products from Canada?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 28, query: "가공식품의 성분표 순서 규정은 어떤 법률에 있나요?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 29, query: "What are the bilingual labelling requirements under CPLA?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 30, query: "How do I register a novel food ingredient with Health Canada?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 31, query: "What are the SFCA penalties for food safety violations?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 32, query: "유기농 식품 인증 절차는 어떻게 되나요?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 33, query: "Can I sell homemade jam at a farmers market in Ontario?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 34, query: "What is the date marking format for best before dates in Canada?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 35, query: "주스 제품의 캐나다 식품 안전 기준은?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 36, query: "What are the nutrition labelling exemptions for small manufacturers?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 37, query: "How to comply with SFCR for meat product traceability?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 38, query: "스낵 제품 라벨에 칼로리 정보를 어떻게 표기하나요?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 39, query: "What is the maximum residue limit for pesticides in fresh produce in Canada?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },
  { id: 40, query: "How do I get a Safe Food for Canadians licence?", expectedDomain: "food", category: "clear-food", difficulty: "easy" },

  // ============================================
  // CATEGORY 3: Food-NHP Boundary (hard) — 30 cases
  // ============================================
  { id: 41, query: "My kombucha product has probiotics and I want to claim digestive health benefits. Is it food or NHP?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 42, query: "프로바이오틱스가 든 요거트에 '장 건강에 도움' 이라는 문구를 넣을 수 있나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 43, query: "Can I add vitamin D to a breakfast cereal and still sell it as food?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 44, query: "I sell a turmeric powder — when does it cross from food/spice to NHP?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 45, query: "강황 파우더를 식품으로 판매하다가 '항염' 효과를 주장하면 어떻게 되나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 46, query: "Is fortified orange juice classified as food or NHP in Canada?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 47, query: "Can protein powder with added BCAAs be sold as food in Canada?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 48, query: "에너지 드링크에 인삼 추출물을 넣으면 NHP로 분류되나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 49, query: "What makes a functional food different from an NHP under Canadian law?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 50, query: "I want to sell gummy vitamins that look like candy — food or NHP?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 51, query: "비타민이 첨가된 시리얼은 식품인가요 NHP인가요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 52, query: "Can a tea product claim to 'help you sleep' without NPN?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 53, query: "Our collagen peptide drink makes no health claims — is it food?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 54, query: "I'm selling hemp seed oil as a cooking oil. Do I need NPN?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 55, query: "If I add medicinal mushroom extract (reishi) to a coffee blend, does it become NHP?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 56, query: "녹차 추출물 캡슐 — 차(food)인가 건강보조식품인가?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 57, query: "Can apple cider vinegar be sold with 'immune support' claims as food?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 58, query: "오메가3 강화 우유는 식품으로 판매할 수 있나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 59, query: "My smoothie mix has added zinc and echinacea. What regulatory category?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 60, query: "If a food product gets a therapeutic claim added, what's the reclassification process?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 61, query: "Difference between food-grade and NHP-grade probiotics under Canadian law?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 62, query: "식품에서 NHP로 재분류하는 법적 절차가 어떻게 되나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 63, query: "Can bone broth make health claims like 'supports joint health'?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 64, query: "I sell moringa leaf powder for cooking. Can I also list its nutritional benefits?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 65, query: "Are electrolyte drinks food or NHP in Canada?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 66, query: "콜라겐 파우더를 식품 첨가물로 쓰면 NHP 인가요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 67, query: "차가버섯 차를 판매하면서 '면역 강화' 주장 가능한가요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 68, query: "What determines if a protein bar is food vs NHP?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 69, query: "Can I sell spirulina as both a food ingredient and a supplement?", expectedDomain: "both", category: "boundary", difficulty: "hard" },
  { id: 70, query: "식품과 NHP 동시에 해당하는 제품이 있을 수 있나요?", expectedDomain: "both", category: "boundary", difficulty: "hard" },

  // ============================================
  // CATEGORY 4: NHP Licensing & Registration — 20 cases
  // ============================================
  { id: 71, query: "How long does it take to get an NPN approval?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 72, query: "NPN 신청 시 필요한 안전성 데이터는 어떤 것들인가요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 73, query: "What is the difference between NPN and DIN-HM?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 74, query: "Can I sell an NHP while my licence application is pending?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 75, query: "제품 라이선스 없이 NHP를 무료 샘플로 배포할 수 있나요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 76, query: "What happens if my NPN expires? Can I still sell remaining stock?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 77, query: "How do I transfer an NPN from one company to another?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 78, query: "시설 라이선스 갱신 절차가 어떻게 되나요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 79, query: "Do I need a separate site licence for each manufacturing location?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 80, query: "Can a foreign manufacturer hold a Canadian NHP site licence?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 81, query: "해외 제조사의 캐나다 NHP 시설 라이선스 취득이 가능한가요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 82, query: "What are the fees for NPN application?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 83, query: "Can I use a monograph pathway for a multi-ingredient NHP?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 84, query: "모노그래프 경로로 복합 성분 제품을 신청할 수 있나요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 85, query: "What is the NHP Product Licensing process for a Traditional Chinese Medicine?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 86, query: "How do I register a homeopathic product under DIN-HM?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 87, query: "What changes to an NHP require a new licence vs amendment?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 88, query: "아유르베다 제품도 캐나다 NHP 라이선스가 필요한가요?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 89, query: "Is there a fast-track process for NHP products with monograph references?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },
  { id: 90, query: "What documentation is needed for a non-monograph NHP licence application?", expectedDomain: "nhp", category: "licensing", difficulty: "medium" },

  // ============================================
  // CATEGORY 5: NHP GMP & Manufacturing — 15 cases
  // ============================================
  { id: 91, query: "What does GUI-0158 require for NHP stability testing?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 92, query: "NHP 제조 시 원료 시험 요건은?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 93, query: "How often are NHP manufacturing facilities inspected?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 94, query: "What is the difference between NHP GMP and food GMP?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 95, query: "건강기능식품 제조시설의 위생 기준은?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 96, query: "Can I contract manufacture NHPs without my own site licence?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 97, query: "What records must be kept under NHP GMP?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 98, query: "NHP 제조에서 품질 관리 책임자 자격 요건은?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 99, query: "What are the NHP packaging and storage requirements under GMP?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 100, query: "Do NHP GMP requirements apply to importers or only manufacturers?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 101, query: "How to handle NHP product recalls under GMP?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 102, query: "NHP 원료 공급업체 감사 요건은?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 103, query: "What are batch record requirements for NHP production?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 104, query: "NHP 제조 과정에서 교차 오염 방지 기준은?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },
  { id: 105, query: "Can an NHP facility also manufacture food products?", expectedDomain: "nhp", category: "gmp", difficulty: "medium" },

  // ============================================
  // CATEGORY 6: NHP Labelling — 15 cases
  // ============================================
  { id: 106, query: "What must appear on an NHP label that doesn't appear on a food label?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 107, query: "NHP 라벨에 NPN 번호는 어디에 표시해야 하나요?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 108, query: "How is the Product Facts table different from Nutrition Facts?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 109, query: "Can I use both English and French on NHP product labels?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 110, query: "NHP 라벨의 복용량 표시 규정은?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 111, query: "What caution and warning statements are required on NHP labels?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 112, query: "Must I declare non-medicinal ingredients on NHP labels?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 113, query: "건강기능식품 라벨에 '치료' 관련 문구를 쓸 수 있나요?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 114, query: "What font size requirements exist for NHP labels?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 115, query: "How do I label a multi-vitamin NHP with 20+ ingredients?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 116, query: "NHP 라벨에 유통기한 표시 방법은?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 117, query: "Can NHP labels include images of medical professionals?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 118, query: "What country of origin rules apply to NHP labelling?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 119, query: "NHP 라벨의 건강 주장 문구 작성 가이드라인은?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },
  { id: 120, query: "Must NHP labels list the source organism for herbal ingredients?", expectedDomain: "nhp", category: "labelling", difficulty: "medium" },

  // ============================================
  // CATEGORY 7: NHP Health Claims — 15 cases
  // ============================================
  { id: 121, query: "What types of health claims are permitted for NHPs in Canada?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 122, query: "Can I claim my NHP 'cures' a disease?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 123, query: "NHP에서 질병 치료 주장과 건강 유지 주장의 차이는?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 124, query: "What evidence standard is needed for NHP structure/function claims?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 125, query: "Can I reference clinical studies on my NHP advertising?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 126, query: "NHP 광고에서 허용되는 건강 주장의 범위는?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 127, query: "What happens if I make unauthorized health claims for an NHP?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 128, query: "Can my NHP claim to reduce risk of disease?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 129, query: "건강 주장 없이 NHP를 판매할 수 있나요?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 130, query: "How are traditional use claims different from modern evidence claims for NHPs?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 131, query: "Can I use testimonials for NHP marketing?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 132, query: "NHP 온라인 광고에도 건강 주장 규제가 적용되나요?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 133, query: "What claims can a probiotic NHP make about gut health?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 134, query: "Can I say my vitamin helps 'boost immune system' on the label?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },
  { id: 135, query: "면역력 강화 주장은 NHP에서만 가능한가요?", expectedDomain: "nhp", category: "health-claims", difficulty: "medium" },

  // ============================================
  // CATEGORY 8: NHP Import/Export — 10 cases
  // ============================================
  { id: 136, query: "Can I import NHP raw materials from China without a site licence?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 137, query: "미국에서 만든 보충제를 캐나다에서 판매하려면?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 138, query: "What customs documentation is needed for importing NHPs?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 139, query: "Can a US-licensed supplement be sold in Canada without NPN?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 140, query: "한국에서 인증받은 건강기능식품을 캐나다에서 바로 판매 가능한가요?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 141, query: "What are the border inspection procedures for NHP imports?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 142, query: "Can I bring personal-use NHPs into Canada from abroad?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 143, query: "NHP 수출을 위한 캐나다 규제 요건이 있나요?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 144, query: "Do imported NHP finished products need re-testing in Canada?", expectedDomain: "nhp", category: "import", difficulty: "medium" },
  { id: 145, query: "What is the CBSA's role in NHP import enforcement?", expectedDomain: "nhp", category: "import", difficulty: "medium" },

  // ============================================
  // CATEGORY 9: NHP Adverse Reactions & Safety — 10 cases
  // ============================================
  { id: 146, query: "What is the 15-day adverse reaction reporting requirement for NHPs?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 147, query: "NHP 부작용이 발생하면 어디에 보고해야 하나요?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 148, query: "What is the Canada Vigilance Program for NHPs?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 149, query: "Must consumers report NHP adverse reactions or only companies?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 150, query: "NHP 리콜 절차는 어떻게 되나요?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 151, query: "What qualifies as a 'serious' adverse reaction for NHPs?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 152, query: "Can Health Canada suspend an NPN due to safety concerns?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 153, query: "NHP와 약물 상호작용 보고 의무가 있나요?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 154, query: "What records must NHP companies keep regarding adverse reactions?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },
  { id: 155, query: "How does MHPD monitor NHP safety post-market?", expectedDomain: "nhp", category: "adverse-reaction", difficulty: "medium" },

  // ============================================
  // CATEGORY 10: Specific NHP Product Types — 20 cases
  // ============================================
  { id: 156, query: "What are the specific regulations for selling melatonin in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 157, query: "Is CBD oil classified as NHP or controlled substance in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "CBD is under Cannabis Act, edge case" },
  { id: 158, query: "멜라토닌은 캐나다에서 어떤 규제를 받나요?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 159, query: "How are essential oils regulated — NHP or cosmetic?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "Depends on claims" },
  { id: 160, query: "Can I sell ephedra-containing products as NHP?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "Restricted under NHPR" },
  { id: 161, query: "어린이용 비타민 제품의 추가 규제 요건은?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 162, query: "Are prenatal vitamins classified as NHP or drugs in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 163, query: "What regulations apply to selling fish oil supplements?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 164, query: "철분 보충제의 캐나다 판매 규제는?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 165, query: "How are weight loss supplements regulated in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 166, query: "Can I sell kratom as NHP in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "Kratom regulatory status ambiguous" },
  { id: 167, query: "관절 건강 보충제(글루코사민) 규제 요건은?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 168, query: "Are sunscreen products NHP or drug in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "Sunscreens are drugs, not NHP" },
  { id: 169, query: "How is activated charcoal supplement regulated?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 170, query: "유산균(락토바실러스) 보충제의 NHP 분류 기준은?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 171, query: "Can I sell kava as an NHP in Canada?", expectedDomain: "nhp", category: "product-type", difficulty: "hard", notes: "Kava has restrictions" },
  { id: 172, query: "What are the rules for selling colostrum supplements?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 173, query: "마그네슘 보충제 종류별(구연산, 산화) 규제 차이가 있나요?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 174, query: "Are enzyme supplements (like digestive enzymes) regulated as NHP?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },
  { id: 175, query: "How are adaptogen supplements (ashwagandha, rhodiola) regulated?", expectedDomain: "nhp", category: "product-type", difficulty: "medium" },

  // ============================================
  // CATEGORY 11: Ambiguous / Tricky Queries — 20 cases
  // ============================================
  { id: 176, query: "What are the labelling rules for supplements in Canada?", expectedDomain: "nhp", category: "ambiguous", difficulty: "medium", notes: "'supplements' should map to NHP" },
  { id: 177, query: "캐나다에서 건강식품 판매 허가는 어떻게 받나요?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard", notes: "'건강식품' is ambiguous — could mean health food or NHP" },
  { id: 178, query: "I want to sell a health product in Canada", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard", notes: "'health product' ambiguous" },
  { id: 179, query: "What licence do I need to manufacture pills in Canada?", expectedDomain: "nhp", category: "ambiguous", difficulty: "medium", notes: "Pills implies supplement/drug" },
  { id: 180, query: "캐나다에서 캡슐 형태 제품 판매 규정은?", expectedDomain: "nhp", category: "ambiguous", difficulty: "medium", notes: "Capsule form implies NHP" },
  { id: 181, query: "How do I sell wellness products online in Canada?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard", notes: "'wellness products' ambiguous" },
  { id: 182, query: "What regulations apply to selling powder supplements?", expectedDomain: "nhp", category: "ambiguous", difficulty: "medium" },
  { id: 183, query: "건강 보조 제품의 캐나다 수입 규제는?", expectedDomain: "nhp", category: "ambiguous", difficulty: "medium" },
  { id: 184, query: "Do I need a licence to sell herbal tea in Canada?", expectedDomain: "both", category: "ambiguous", difficulty: "hard", notes: "Herbal tea can be food or NHP depending on claims" },
  { id: 185, query: "생약 차를 캐나다에서 판매하려면 어떤 허가가 필요하나요?", expectedDomain: "both", category: "ambiguous", difficulty: "hard" },
  { id: 186, query: "What is the regulatory pathway for a nutraceutical in Canada?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard", notes: "'nutraceutical' not a legal term in Canada" },
  { id: 187, query: "Can I sell medicinal herbs at a farmer's market?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard" },
  { id: 188, query: "약초를 파머스 마켓에서 팔 수 있나요?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard" },
  { id: 189, query: "What are Canadian rules for selling detox products?", expectedDomain: "nhp", category: "ambiguous", difficulty: "hard", notes: "'detox' implies therapeutic claim" },
  { id: 190, query: "I want to sell a meal replacement shake — what rules apply?", expectedDomain: "both", category: "ambiguous", difficulty: "hard", notes: "Meal replacement can be food or NHP" },
  { id: 191, query: "식이 보충제와 식품의 규제 차이점은?", expectedDomain: "both", category: "ambiguous", difficulty: "hard" },
  { id: 192, query: "What's the difference between a health claim on food vs NHP?", expectedDomain: "both", category: "ambiguous", difficulty: "medium" },
  { id: 193, query: "Can energy bars with added vitamins be sold without NPN?", expectedDomain: "both", category: "ambiguous", difficulty: "hard" },
  { id: 194, query: "How are sports nutrition products classified in Canada?", expectedDomain: "both", category: "ambiguous", difficulty: "hard", notes: "Sports nutrition straddles food/NHP" },
  { id: 195, query: "단백질 보충제 규제는 식품인가 건강기능식품인가?", expectedDomain: "both", category: "ambiguous", difficulty: "hard" },

  // ============================================
  // CATEGORY 12: NHP Enforcement & Compliance — 5 cases
  // ============================================
  { id: 196, query: "What penalties exist for selling NHPs without NPN in Canada?", expectedDomain: "nhp", category: "enforcement", difficulty: "medium" },
  { id: 197, query: "무허가 NHP 판매 시 처벌 규정은?", expectedDomain: "nhp", category: "enforcement", difficulty: "medium" },
  { id: 198, query: "How does HPFBI enforce NHP compliance?", expectedDomain: "nhp", category: "enforcement", difficulty: "medium" },
  { id: 199, query: "Can Health Canada seize unauthorized NHPs at the border?", expectedDomain: "nhp", category: "enforcement", difficulty: "medium" },
  { id: 200, query: "NHP 규제 위반 시 리콜 명령 절차는 어떻게 되나요?", expectedDomain: "nhp", category: "enforcement", difficulty: "medium" },
];
