/**
 * NHP (Natural Health Products) Regulation Sections - Seed Data
 *
 * Detailed content from the Natural Health Products Regulations (SOR/2003-196),
 * GMP guidelines, site licensing, labelling, and related guidance documents.
 *
 * Sources:
 * - Justice Laws Website (laws-lois.justice.gc.ca)
 * - Health Canada NHP Guidance Documents
 */

import type { SectionSeed } from "./sections";

export const NHP_REGULATION_SECTIONS: readonly SectionSeed[] = [
  // ============================================
  // NHPR — DEFINITIONS & SCOPE (Part 1)
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.1",
    title_en: "Definitions — Natural Health Product",
    title_ko: "정의 — 천연건강제품",
    content_en:
      'A "natural health product" means a substance set out in Schedule 1, or a combination of substances in which all medicinal ingredients are substances set out in Schedule 1, a homeopathic medicine or a traditional medicine, that is manufactured, sold or represented for use in: (a) the diagnosis, treatment, mitigation or prevention of a disease, disorder or abnormal physical state or its symptoms; (b) restoring or correcting organic functions; or (c) maintaining or promoting health or otherwise modifying organic functions in humans. NHP does NOT include a substance in Schedule 2, or any combination containing a Schedule 2 substance, or a product requiring a prescription under the Food and Drug Regulations.',
    content_ko:
      '"천연건강제품"이란 Schedule 1에 명시된 물질, 또는 모든 약용 성분이 Schedule 1 물질인 조합, 동종요법 의약품 또는 전통 의약품으로서, (a) 질병, 장애 또는 비정상적 신체 상태의 진단, 치료, 완화 또는 예방; (b) 기관 기능의 회복 또는 교정; (c) 건강 유지·증진 또는 기관 기능 변경을 목적으로 제조, 판매 또는 표시되는 것을 의미합니다. Schedule 2 물질이나 처방전이 필요한 제품은 NHP에 해당하지 않습니다.',
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-1.html",
    topics: ["definitions", "scope", "classification", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 1,
  },
  {
    regulation_short_name: "NHPR",
    section_number: "s.1-Schedule1",
    title_en: "Schedule 1 — Substances That May Be NHPs",
    title_ko: "Schedule 1 — NHP가 될 수 있는 물질",
    content_en:
      "Schedule 1 of the NHPR lists the categories of substances that qualify as natural health products: (1) a plant or plant material, an alga, a bacterium, a fungus, or a non-human animal material; (2) an extract or isolate of any substance in (1) where the starting material is the substance; (3) a vitamin or amino acid; (4) an essential fatty acid; (5) a synthetic duplicate of a substance in (1)-(4); (6) a mineral; (7) a probiotic. These substances form the basis for NHP product licence applications.",
    content_ko:
      "NHPR Schedule 1은 천연건강제품으로 인정되는 물질 범주를 나열합니다: (1) 식물·식물 소재, 조류, 박테리아, 곰팡이, 비인간 동물 소재; (2) (1)의 추출물 또는 분리물; (3) 비타민 또는 아미노산; (4) 필수 지방산; (5) (1)-(4)의 합성 복제물; (6) 미네랄; (7) 프로바이오틱스.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-18.html",
    topics: ["schedule", "substances", "classification", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 1,
    sort_order: 2,
  },

  // ============================================
  // NHPR — PRODUCT LICENSING (Part 1)
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.5",
    title_en: "Prohibition — Sale Without Product Licence",
    title_ko: "제품 라이선스 없는 판매 금지",
    content_en:
      "No person shall sell a natural health product unless the Minister has, on the basis of an assessment, issued a product licence for that product, the product is manufactured, packaged, labelled and stored in accordance with the licence, and the licence has not been suspended or cancelled. The product licence is identified by a Natural Product Number (NPN) for general NHPs or a Drug Identification Number-Homeopathic Medicine (DIN-HM) for homeopathic products. The NPN/DIN-HM must be displayed on the product label.",
    content_ko:
      "장관이 평가에 기반하여 제품 라이선스를 발급하지 않은 한, 어떤 사람도 천연건강제품을 판매할 수 없습니다. 제품은 라이선스에 따라 제조, 포장, 라벨링 및 보관되어야 하며, 라이선스가 정지 또는 취소되지 않아야 합니다. 일반 NHP는 NPN(Natural Product Number), 동종요법 제품은 DIN-HM으로 식별됩니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-2.html",
    topics: ["licensing", "prohibition", "npn", "din-hm", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 3,
  },
  {
    regulation_short_name: "NHPR",
    section_number: "s.6-8",
    title_en: "Product Licence Application Requirements",
    title_ko: "제품 라이선스 신청 요건",
    content_en:
      "A product licence application must include: (a) the brand name; (b) the medicinal ingredients with their proper/common names, quantities per dosage unit, and potency (if applicable); (c) the non-medicinal ingredients; (d) the recommended use or purpose (health claim); (e) the recommended route of administration, dosage form, and dose; (f) the recommended duration of use; (g) risk information including cautions, warnings, contraindications, and known adverse reactions; (h) the source material of each medicinal ingredient; (i) the specifications for the finished product; (j) evidence of safety and efficacy. Applications referencing a Compendium monograph qualify for 60-day fast-track processing.",
    content_ko:
      "제품 라이선스 신청에는 다음이 포함되어야 합니다: (a) 브랜드명; (b) 약용 성분의 적절한/일반 명칭, 용량 단위별 함량 및 역가; (c) 비약용 성분; (d) 권장 용도/목적(건강 주장); (e) 투여 경로, 제형, 용량; (f) 권장 사용 기간; (g) 주의사항, 경고, 금기, 알려진 부작용 등 위험 정보; (h) 각 약용 성분의 원료; (i) 완제품 규격; (j) 안전성 및 유효성 근거. 모노그래프 참조 신청은 60일 신속 처리 대상.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-2.html",
    topics: ["licensing", "application", "requirements", "health_claims", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 4,
  },
  {
    regulation_short_name: "NHPR",
    section_number: "s.11-12",
    title_en: "Fundamental Changes Requiring New Licence",
    title_ko: "새 라이선스가 필요한 근본적 변경",
    content_en:
      "A new product licence application is required for any fundamental change including: (a) a change to the dosage form; (b) a change to the route of administration; (c) a change in the quantity of a medicinal ingredient (outside of approved range); (d) the addition or removal of a medicinal ingredient. Minor changes (e.g., labelling updates, non-medicinal ingredient changes, manufacturing site changes) may be notified without a new application, but must still be filed with NNHPD.",
    content_ko:
      "다음의 근본적 변경에는 새 제품 라이선스 신청이 필요합니다: (a) 제형 변경; (b) 투여 경로 변경; (c) 약용 성분 함량 변경(승인 범위 외); (d) 약용 성분의 추가 또는 제거. 경미한 변경(라벨링 업데이트, 비약용 성분 변경, 제조 시설 변경 등)은 새 신청 없이 통보할 수 있으나 NNHPD에 보고해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-3.html",
    topics: ["licensing", "changes", "amendments", "nhp"],
    applies_to: ["production"],
    depth_level: 0,
    sort_order: 5,
  },

  // ============================================
  // NHPR — SITE LICENSING (Part 2)
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.27-28",
    title_en: "Site Licence Requirement",
    title_ko: "시설 라이선스 요건",
    content_en:
      "Every person who manufactures, packages, labels, or imports a natural health product for the purpose of sale must hold a site licence. The site licence application must include: the name and address of the site, the activities to be performed (manufacture, package, label, import), the dosage forms to be handled, and evidence of GMP compliance. Foreign manufacturing sites do not need their own Canadian site licence, but the Canadian importer must hold a site licence and ensure foreign sites meet Canadian GMP standards. Site licences must be renewed before expiry.",
    content_ko:
      "천연건강제품을 판매 목적으로 제조, 포장, 라벨링 또는 수입하는 모든 사람은 시설 라이선스를 보유해야 합니다. 신청에는 시설 명칭과 주소, 수행 활동(제조, 포장, 라벨링, 수입), 취급 제형, GMP 준수 증거가 포함되어야 합니다. 외국 제조 시설은 캐나다 시설 라이선스가 필요하지 않지만, 캐나다 수입자가 시설 라이선스를 보유하고 외국 시설이 캐나다 GMP 기준을 충족하도록 해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-7.html",
    topics: ["site_licence", "licensing", "import", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 6,
  },

  // ============================================
  // NHPR — GOOD MANUFACTURING PRACTICES (Part 3)
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.43-62",
    title_en: "Good Manufacturing Practices — Overview",
    title_ko: "우수제조관리기준(GMP) — 개요",
    content_en:
      "Part 3 of the NHPR establishes GMP requirements organized into four categories: (1) PLACES (Premises & Equipment): Sites must be designed, constructed, and maintained to prevent contamination. Equipment must be suitable for intended use and properly maintained. (2) PEOPLE (Personnel): Must be qualified by education, training, or experience. Ongoing training required. Health and hygiene protocols mandatory. (3) PROCESSES: Written procedures for all operations. Quality assurance oversight before sale. Validation and verification protocols. Comprehensive record maintenance (minimum one year post-expiry). (4) PRODUCTS: Stability testing to establish expiry dates. Batch records and traceability. Contamination prevention. Raw material and finished product testing required.",
    content_ko:
      "NHPR Part 3는 GMP 요건을 4가지 범주로 규정합니다: (1) 장소(시설 및 장비): 오염 방지를 위한 설계, 건설, 유지관리. (2) 사람(인력): 교육, 훈련 또는 경험에 의한 자격. 지속적 교육. 위생 프로토콜. (3) 공정: 모든 작업의 문서화된 절차. 판매 전 품질보증 감독. 검증 프로토콜. 최소 유효기한 후 1년간 기록 유지. (4) 제품: 유효기한 설정을 위한 안정성 시험. 배치 기록 및 추적. 원료 및 완제품 시험.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-9.html",
    topics: ["gmp", "manufacturing", "quality_assurance", "nhp"],
    applies_to: ["production"],
    depth_level: 0,
    sort_order: 7,
  },
  {
    regulation_short_name: "NHP-GMP-GUIDE",
    section_number: "GUI-0158-v4",
    title_en: "GMP Guide for NHPs — Version 4 (Effective March 4, 2026)",
    title_ko: "NHP GMP 가이드 — 버전 4 (2026년 3월 4일 시행)",
    content_en:
      "The GMP Guide (GUI-0158) Version 4 provides detailed interpretation of Part 3 GMP requirements. Key updates include: alignment with current industry practices, enhanced quality risk management expectations, clarified testing requirements for raw materials and finished products, updated stability testing guidance, strengthened documentation requirements, and new sections on data integrity. The transition period ran from September 4, 2025 to March 4, 2026. All NHP manufacturers must comply with Version 4 requirements from March 4, 2026.",
    content_ko:
      "GMP 가이드(GUI-0158) 버전 4는 Part 3 GMP 요건의 상세 해석을 제공합니다. 주요 업데이트: 현행 산업 관행 정렬, 품질 리스크 관리 기대 강화, 원료 및 완제품 시험 요건 명확화, 안정성 시험 가이드 업데이트, 문서화 요건 강화, 데이터 무결성 신규 섹션. 전환기간: 2025.9.4~2026.3.4.",
    section_url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/good-manufacturing-practices/guidance-documents/guide-natural-health-products-0158.html",
    topics: ["gmp", "guide", "quality_assurance", "testing", "nhp"],
    applies_to: ["production"],
    depth_level: 1,
    sort_order: 8,
  },

  // ============================================
  // NHPR — LABELLING (Part 1, Division 4)
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.93-106",
    title_en: "NHP Labelling Requirements",
    title_ko: "NHP 라벨링 요건",
    content_en:
      'NHP labels must include all of the following mandatory elements: (1) Product name and NPN or DIN-HM number prominently displayed; (2) "Product Facts" table (NOT "Nutrition Facts" or "Supplement Facts"); (3) All medicinal ingredients with name, quantity per dosage unit, and potency; (4) All non-medicinal ingredients; (5) Recommended conditions of use (dosage, route of administration, duration); (6) Risk information: cautions, warnings, contraindications, known adverse reactions; (7) Lot number and expiry date; (8) Name and address of product licence holder; (9) Proper storage conditions. ALL mandatory label elements must be in BOTH English and French (bilingual requirement). Food allergen and gluten source declarations are also required where applicable.',
    content_ko:
      'NHP 라벨에는 다음 필수 요소가 모두 포함되어야 합니다: (1) 제품명 및 NPN/DIN-HM 번호 눈에 띄게 표시; (2) "Product Facts" 표 ("Nutrition Facts"나 "Supplement Facts"가 아님); (3) 모든 약용 성분의 명칭, 단위 용량당 함량, 역가; (4) 모든 비약용 성분; (5) 권장 사용 조건(용량, 투여 경로, 기간); (6) 위험 정보: 주의사항, 경고, 금기, 알려진 부작용; (7) 로트 번호 및 유효기한; (8) 라이선스 보유자 명칭 및 주소; (9) 적절한 보관 조건. 모든 필수 라벨 요소는 영어와 프랑스어 양쪽 다 필요(이중 언어 요건). 식품 알레르겐 및 글루텐 출처 표시도 해당 시 필수.',
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-14.html",
    topics: ["labeling", "packaging", "bilingual", "product_facts", "nhp"],
    applies_to: ["labeling", "production"],
    depth_level: 0,
    sort_order: 9,
  },

  // ============================================
  // NHPR — HEALTH CLAIMS
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.6(2)-claims",
    title_en: "NHP Health Claims Regime",
    title_ko: "NHP 건강 기능 주장 체계",
    content_en:
      "NHPs may make the following types of health claims: (1) Traditional use claims: based on traditional medicine systems (e.g., Traditional Chinese Medicine, Ayurveda) with at least 50 years of documented use; (2) Scientific evidence claims: supported by published clinical studies or well-established scientific evidence; (3) Structure/function claims: claims about maintaining or supporting normal body functions; (4) Monograph claims: claims pre-approved in the NNHPD Compendium of Monographs. PROHIBITED: Claims for Schedule A.1 diseases (serious diseases requiring medical supervision such as cancer, diabetes, heart disease) unless specifically authorized. All health claims must be authorized as part of the product licence.",
    content_ko:
      "NHP는 다음 유형의 건강 기능 주장을 할 수 있습니다: (1) 전통 사용 주장: 전통 의학 체계 기반, 최소 50년 문서화된 사용 이력 필요; (2) 과학적 근거 주장: 출판된 임상 연구 또는 확립된 과학적 근거; (3) 구조/기능 주장: 정상적 신체 기능 유지/지원; (4) 모노그래프 주장: NNHPD 편람에서 사전 승인된 주장. 금지: Schedule A.1 질병(암, 당뇨, 심장질환 등 의학적 감독이 필요한 심각한 질병)에 대한 주장. 모든 건강 주장은 제품 라이선스의 일부로 승인되어야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-2.html",
    topics: ["health_claims", "traditional_use", "evidence", "nhp"],
    applies_to: ["labeling", "licensing"],
    depth_level: 0,
    sort_order: 10,
  },

  // ============================================
  // NHPR — ADVERSE REACTION REPORTING
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.24-26",
    title_en: "Adverse Reaction Reporting Obligations",
    title_ko: "부작용 보고 의무",
    content_en:
      "Product licence holders have mandatory adverse reaction reporting obligations: (1) SERIOUS adverse reactions: Must be reported to the Canada Vigilance Program within 15 CALENDAR DAYS of becoming aware. A serious adverse reaction is one that results in death, is life-threatening, requires hospitalization, results in persistent disability, or is a congenital anomaly. (2) ANNUAL summary reports: Due annually, summarizing all adverse reactions received. (3) RECALL obligations: Any recall must be reported to Health Canada immediately. Records of all adverse reactions must be maintained and made available to inspectors. Post-market surveillance is coordinated by the Marketed Health Products Directorate (MHPD) through the Canada Vigilance Program.",
    content_ko:
      "제품 라이선스 보유자의 의무적 부작용 보고: (1) 심각한 부작용: 인지 후 15일(역일) 이내 Canada Vigilance 프로그램에 보고. 사망, 생명 위협, 입원 필요, 지속적 장애, 선천적 이상을 초래하는 반응. (2) 연간 요약 보고서: 매년 제출, 모든 수신된 부작용 요약. (3) 리콜 의무: 리콜 즉시 Health Canada에 보고. 모든 부작용 기록은 유지되어야 하며 검사관에게 제공 가능해야 합니다. 시판 후 감시는 MHPD가 Canada Vigilance 프로그램을 통해 조정합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-6.html",
    topics: ["adverse_reactions", "reporting", "post_market", "surveillance", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 11,
  },

  // ============================================
  // NHPR — IMPORT REQUIREMENTS
  // ============================================
  {
    regulation_short_name: "NHP-IMPORT-GUIDE",
    section_number: "import-overview",
    title_en: "NHP Import Requirements — Overview",
    title_ko: "NHP 수입 요건 — 개요",
    content_en:
      "Importing NHPs into Canada requires: (1) The product must have a valid product licence (NPN or DIN-HM) BEFORE importation; (2) The Canadian importer must hold a valid SITE LICENCE for importing; (3) The foreign manufacturing site must comply with Canadian GMP requirements — the importer is responsible for ensuring this; (4) CBSA may detain non-compliant products at the border under Customs Act s.101; (5) All labelling must be compliant with Canadian requirements (bilingual, Product Facts table, etc.) before the product enters Canada; (6) Proper documentation must accompany shipments including product licence numbers, importer licence information, and quality assurance reports. Health Canada and CBSA coordinate border enforcement for NHP compliance.",
    content_ko:
      "캐나다로 NHP를 수입하려면: (1) 수입 전 유효한 제품 라이선스(NPN/DIN-HM) 필요; (2) 캐나다 수입자가 유효한 시설 라이선스 보유 필요; (3) 외국 제조 시설이 캐나다 GMP 요건 준수 — 수입자가 이를 보장할 책임; (4) CBSA가 관세법 s.101에 따라 비적합 제품을 국경에서 억류 가능; (5) 모든 라벨링이 캐나다 요건(이중 언어, Product Facts 표 등) 충족해야 함; (6) 제품 라이선스 번호, 수입자 라이선스 정보, 품질보증 보고서 등 적절한 문서 동반 필요.",
    section_url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/importation-exportation/commercial-use-health-products-guidance/document.html",
    topics: ["import", "border", "cbsa", "site_licence", "nhp"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 12,
  },

  // ============================================
  // FOOD-NHP INTERFACE / CLASSIFICATION
  // ============================================
  {
    regulation_short_name: "FOOD-NHP-INTERFACE",
    section_number: "classification-criteria",
    title_en: "Food vs NHP Classification Criteria",
    title_ko: "식품 vs NHP 분류 기준",
    content_en:
      'The primary legal distinction between food and NHP in Canada is the PRESENCE OF HEALTH CLAIMS. Key principles: (1) A product represented for therapeutic use (diagnosing, treating, mitigating, preventing disease, restoring/correcting organic functions) = NHP, regulated by Health Canada NNHPD under NHPR. (2) A product sold as food or drink for human consumption without therapeutic claims = Food, regulated by CFIA under SFCA/SFCR. (3) GREY AREAS: Functional foods with bioactive substances but NO therapeutic claims → Food regulations. Nutraceuticals WITH therapeutic claims → NHP regulations. Fortified foods → depends on claims made. (4) A single product CANNOT be both food and NHP simultaneously. Health Canada determines classification on a case-by-case basis. (5) Foods may make limited "nutrient function claims" and "health claims" under FDR, but NOT therapeutic claims. If a food product starts making therapeutic claims, it must be licensed as an NHP.',
    content_ko:
      '캐나다에서 식품과 NHP의 핵심 법적 구분은 건강 기능 주장의 유무입니다. 핵심 원칙: (1) 치료적 용도로 표시된 제품(질병 진단/치료/완화/예방, 기관 기능 회복/교정) = NHP, Health Canada NNHPD가 NHPR에 따라 규제. (2) 치료적 주장 없이 식품/음료로 판매되는 제품 = 식품, CFIA가 SFCA/SFCR에 따라 규제. (3) 회색 지대: 생리활성 물질이 있지만 치료적 주장이 없는 기능성 식품 → 식품 규정. 치료적 주장이 있는 건강기능식품 → NHP 규정. (4) 단일 제품이 식품과 NHP 둘 다일 수 없음. (5) 식품에서 치료적 주장을 시작하면 NHP로 허가받아야 함.',
    section_url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/natural-non-prescription/legislation-guidelines/guidance-documents/classification-products-at-food-natural-health-product-interface.html",
    topics: ["classification", "food_nhp_boundary", "health_claims", "functional_foods"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 13,
  },

  // ============================================
  // NHPR — ENFORCEMENT & COMPLIANCE
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "enforcement",
    title_en: "NHP Enforcement and Compliance Actions",
    title_ko: "NHP 집행 및 컴플라이언스 조치",
    content_en:
      'Health Canada\'s enforcement powers for NHPs include: (1) PRODUCT LICENCE suspension or cancellation for non-compliance; (2) "DIRECTION TO STOP SALE" orders — immediate prohibition on selling a specific product; (3) SITE LICENCE suspension or cancellation for GMP violations; (4) PRODUCT SEIZURE and detention at the border (in cooperation with CBSA); (5) RECALL authority — both voluntary and mandatory recalls; (6) PUBLIC ADVISORIES warning consumers about non-compliant products; (7) PROSECUTION under the Food and Drugs Act for serious violations. Vanessa\'s Law (Protecting Canadians from Unsafe Drugs Act) strengthened enforcement powers including: mandatory adverse reaction reporting, recall authority, increased penalties, and the ability to impose conditions on licences.',
    content_ko:
      'Health Canada의 NHP 집행 권한: (1) 비준수 시 제품 라이선스 정지 또는 취소; (2) "판매 중지 명령" — 특정 제품의 즉각적 판매 금지; (3) GMP 위반 시 시설 라이선스 정지 또는 취소; (4) CBSA와 협력한 국경에서의 제품 압류 및 억류; (5) 자발적 및 의무적 리콜 권한; (6) 비적합 제품에 대한 소비자 경고 공개 자문; (7) 심각한 위반에 대한 식품의약품법에 따른 기소. 바네사법이 강화한 권한: 의무적 부작용 보고, 리콜 권한, 벌금 인상, 라이선스 조건 부과.',
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-5.html",
    topics: ["enforcement", "compliance", "recall", "penalties", "nhp"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 14,
  },

  // ============================================
  // NHP MONOGRAPHS
  // ============================================
  {
    regulation_short_name: "NHP-MONOGRAPHS",
    section_number: "compendium-overview",
    title_en: "Compendium of Monographs — Product Licensing Evidence",
    title_ko: "모노그래프 편람 — 제품 라이선스 근거",
    content_en:
      "The NNHPD Compendium of Monographs is a collection of pre-assessed ingredient monographs that simplify the product licensing process. Types: (1) COMPLETE MONOGRAPHS: Include recommended uses, dosages, risk information — can support a full product licence application. Applications matching a monograph exactly qualify for 60-day fast-track processing. (2) SAFETY-ONLY MONOGRAPHS: Address safety concerns but do NOT include recommended uses — cannot support licensing alone (additional efficacy evidence needed). Key rules: Only ONE monograph per application. The product must match the monograph EXACTLY (no modifications to dosage, claims, or conditions). Products combining ingredients from different monographs require a full (non-monograph) application.",
    content_ko:
      "NNHPD 모노그래프 편람은 제품 라이선스 절차를 간소화하는 사전 평가된 성분 모노그래프 모음입니다. 유형: (1) 완전 모노그래프: 권장 용도, 용량, 위험 정보 포함 — 전체 제품 라이선스 신청 지원 가능. 모노그래프와 정확히 일치하는 신청은 60일 신속 처리. (2) 안전성 전용 모노그래프: 안전성만 다루며 권장 용도 미포함 — 단독으로 라이선스 지원 불가. 핵심 규칙: 신청당 모노그래프 1개만. 제품이 모노그래프와 정확히 일치해야 함.",
    section_url: "https://www.canada.ca/en/health-canada/services/drugs-health-products/natural-non-prescription/applications-submissions/product-licensing/compendium-monographs.html",
    topics: ["monographs", "licensing", "evidence", "fast_track", "nhp"],
    applies_to: ["licensing"],
    depth_level: 0,
    sort_order: 15,
  },

  // ============================================
  // SELF-CARE FRAMEWORK / MODERNIZATION
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "self-care-framework",
    title_en: "Self-Care Framework — NHP Regulatory Modernization",
    title_ko: "셀프케어 프레임워크 — NHP 규제 현대화",
    content_en:
      "Health Canada is modernizing NHP regulation through the Self-Care Framework. Key changes (2025-2026): (1) Risk-based categorization: Enhanced product classification system based on risk level; (2) Annual notifications: Licence holders must confirm products are still marketed; (3) Strengthened GMP requirements aligned with international standards; (4) Risk-based site licensing with inspection frequency tied to risk; (5) Red tape reduction: Simplified application requirements effective September 2025; (6) Cost recovery: Future implementation of fees for regulatory activities (under development); (7) Enhanced post-market surveillance using real-world evidence. These changes aim to improve consumer access to safe NHPs while maintaining rigorous safety oversight.",
    content_ko:
      "Health Canada는 셀프케어 프레임워크를 통해 NHP 규제를 현대화 중입니다. 주요 변경(2025-2026): (1) 리스크 기반 분류: 위험 수준에 따른 향상된 제품 분류; (2) 연간 통보: 라이선스 보유자가 제품의 시판 지속 확인 필요; (3) 국제 기준에 맞춘 GMP 요건 강화; (4) 리스크 기반 시설 라이선스; (5) 2025년 9월부터 간소화된 신청 요건; (6) 향후 규제 활동 수수료 도입(개발 중); (7) 실세계 근거를 활용한 시판 후 감시 강화.",
    section_url: "https://www.canada.ca/en/health-canada/corporate/about-health-canada/legislation-guidelines/acts-regulations/forward-regulatory-plan/plan/self-care-framework.html",
    topics: ["modernization", "self_care", "regulatory_changes", "nhp"],
    applies_to: ["production", "import", "licensing"],
    depth_level: 0,
    sort_order: 16,
  },
];
