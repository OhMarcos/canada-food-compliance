/**
 * Regulation Sections - Seed Data
 *
 * Actual content from Canadian food laws organized by regulation.
 * Each section includes the real section number, title, content summary,
 * and applicable topics for retrieval.
 *
 * Sources:
 * - Justice Laws Website (laws-lois.justice.gc.ca)
 * - CFIA Guidance Documents (inspection.canada.ca)
 */

export interface SectionSeed {
  readonly regulation_short_name: string;
  readonly section_number: string;
  readonly title_en: string;
  readonly title_ko: string;
  readonly content_en: string;
  readonly content_ko: string;
  readonly section_url: string;
  readonly topics: readonly string[];
  readonly applies_to: readonly string[];
  readonly depth_level: number;
  readonly sort_order: number;
}

export const REGULATION_SECTIONS: readonly SectionSeed[] = [
  // ============================================
  // SAFE FOOD FOR CANADIANS ACT (SFCA)
  // ============================================
  {
    regulation_short_name: "SFCA",
    section_number: "s.2",
    title_en: "Definitions",
    title_ko: "정의",
    content_en:
      "Key definitions under SFCA: 'food' means any article manufactured, sold or represented for use as food or drink for human beings, including chewing gum and any ingredient that may be mixed with food for any purpose whatever. 'import' means to import into Canada. 'licence' means a licence issued under section 20. 'food commodity' means a food, an ingredient that may be mixed with food, or anything that is used in or on a food or ingredient.",
    content_ko:
      "SFCA 주요 정의: '식품'이란 인간의 식품 또는 음료로 사용하기 위해 제조, 판매 또는 표시되는 모든 물품을 의미하며, 껌과 어떤 목적으로든 식품에 혼합될 수 있는 모든 성분을 포함합니다. '수입'이란 캐나다로 수입하는 것을 의미합니다. '라이선스'란 제20조에 따라 발급된 라이선스를 의미합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/page-1.html#h-429883",
    topics: ["definitions", "scope"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 1,
  },
  {
    regulation_short_name: "SFCA",
    section_number: "s.6(1)",
    title_en: "Prohibition — Import",
    title_ko: "수입 금지 조항",
    content_en:
      "No person shall import a food commodity unless the person is authorized to do so by a licence or is exempt from the requirement to hold a licence, and the food commodity meets all the requirements of the Act and regulations. This is the foundational prohibition that requires all food importers to hold a valid Safe Food for Canadians (SFC) licence before importing any food product into Canada.",
    content_ko:
      "어떤 사람도 라이선스에 의해 허가되거나 라이선스 보유 요건에서 면제되지 않는 한 식품 상품을 수입할 수 없으며, 해당 식품 상품은 법 및 규정의 모든 요건을 충족해야 합니다. 이것은 모든 식품 수입업자가 캐나다에 식품을 수입하기 전에 유효한 SFC 라이선스를 보유해야 하는 기본 금지 조항입니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/page-2.html#h-429920",
    topics: ["import", "licensing", "prohibition"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 2,
  },
  {
    regulation_short_name: "SFCA",
    section_number: "s.7",
    title_en: "Prohibition — Unsafe Food",
    title_ko: "안전하지 않은 식품 금지",
    content_en:
      "No person shall manufacture, prepare, package, label, sell, import or advertise any food commodity that is unsafe for human consumption, has a poisonous or harmful substance, is unfit for human consumption, consists in whole or in part of any filthy, putrid, disgusting, rotten, decomposed or diseased animal or vegetable substance, is adulterated, or was manufactured under unsanitary conditions.",
    content_ko:
      "어떤 사람도 인간 소비에 안전하지 않거나, 독성 또는 유해 물질이 포함되었거나, 인간 소비에 부적합하거나, 전부 또는 일부가 더럽거나 부패하거나 역겨운 동물 또는 식물 물질로 구성되었거나, 불순물이 섞였거나, 비위생적인 조건에서 제조된 식품 상품을 제조, 준비, 포장, 라벨링, 판매, 수입 또는 광고할 수 없습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/page-2.html#h-429926",
    topics: ["safety", "prohibition", "adulteration"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 3,
  },
  {
    regulation_short_name: "SFCA",
    section_number: "s.9",
    title_en: "Prohibition — Deceptive Practices",
    title_ko: "기만적 행위 금지",
    content_en:
      "No person shall manufacture, prepare, package, label, sell, import or advertise any food commodity in a manner that is false, misleading or deceptive or is likely to create an erroneous impression regarding its character, quality, value, composition, merit or safety. This includes misleading health claims, false origin claims, and deceptive packaging.",
    content_ko:
      "어떤 사람도 식품 상품의 성격, 품질, 가치, 구성, 장점 또는 안전성에 관하여 허위, 오해의 소지가 있거나 기만적이거나 잘못된 인상을 줄 수 있는 방식으로 식품 상품을 제조, 준비, 포장, 라벨링, 판매, 수입 또는 광고할 수 없습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/page-2.html#h-429934",
    topics: ["labeling", "advertising", "deception", "claims"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 4,
  },
  {
    regulation_short_name: "SFCA",
    section_number: "s.20",
    title_en: "Licences",
    title_ko: "라이선스",
    content_en:
      "The Minister may, on application, issue a licence authorizing the importation, exportation, interprovincial trade or any activity in respect of a food commodity. A licence may be subject to any conditions that the Minister considers appropriate. The SFC licence is obtained through CFIA's My CFIA portal. An importer must hold a valid SFC licence before importing food into Canada. The licence is free of charge.",
    content_ko:
      "장관은 신청에 따라 식품 상품의 수입, 수출, 주간 무역 또는 관련 활동을 허가하는 라이선스를 발급할 수 있습니다. 라이선스는 장관이 적절하다고 판단하는 조건에 따를 수 있습니다. SFC 라이선스는 CFIA의 My CFIA 포털을 통해 획득합니다. 수입업자는 캐나다에 식품을 수입하기 전에 유효한 SFC 라이선스를 보유해야 합니다. 라이선스는 무료입니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/S-1.1/page-5.html#h-430020",
    topics: ["licensing", "import", "application"],
    applies_to: ["import", "production"],
    depth_level: 0,
    sort_order: 5,
  },

  // ============================================
  // SAFE FOOD FOR CANADIANS REGULATIONS (SFCR)
  // ============================================
  {
    regulation_short_name: "SFCR",
    section_number: "Part 4 - s.47-51",
    title_en: "Licensing Requirements",
    title_ko: "라이선스 요건",
    content_en:
      "Part 4 of SFCR details licensing requirements. Section 47: A person must hold a licence to import a food commodity into Canada. Section 48: Licence exemptions apply to (a) personal use imports of less than 20 kg, (b) food imported under specific trade programs. Section 49: Licence conditions may include maintaining a Preventive Control Plan. Section 50: Licence application must be made through CFIA's online system (My CFIA). Section 51: The licence holder must notify CFIA of any changes within 10 business days.",
    content_ko:
      "SFCR 제4부는 라이선스 요건을 상세히 규정합니다. 제47조: 캐나다로 식품 상품을 수입하려면 라이선스를 보유해야 합니다. 제48조: (a) 20kg 미만의 개인 사용 수입, (b) 특정 무역 프로그램에 따른 수입에는 면제가 적용됩니다. 제49조: 라이선스 조건에는 예방관리계획 유지가 포함될 수 있습니다. 제50조: 라이선스 신청은 CFIA의 온라인 시스템(My CFIA)을 통해 해야 합니다. 제51조: 라이선스 보유자는 변경 사항을 10 영업일 이내에 CFIA에 통지해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-10.html",
    topics: ["licensing", "import", "requirements", "exemptions"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 10,
  },
  {
    regulation_short_name: "SFCR",
    section_number: "Part 4 - s.52-58",
    title_en: "Preventive Control Plans (PCP)",
    title_ko: "예방관리계획 (PCP)",
    content_en:
      "Sections 52-58 establish requirements for Preventive Control Plans. A PCP is a written document that identifies and addresses potential hazards. For importers, the PCP must: (a) identify biological, chemical, and physical hazards, (b) describe preventive control measures, (c) include procedures for monitoring, corrective actions, and verification, (d) include traceability procedures. Importers must have a PCP that demonstrates the imported food is safe and meets Canadian requirements. The PCP is based on HACCP principles but adapted for the Canadian regulatory context.",
    content_ko:
      "제52-58조는 예방관리계획 요건을 수립합니다. PCP는 잠재적 위험을 식별하고 해결하는 서면 문서입니다. 수입업자의 PCP에는: (a) 생물학적, 화학적, 물리적 위험 식별, (b) 예방 관리 조치 설명, (c) 모니터링, 시정 조치 및 검증 절차, (d) 추적 절차가 포함되어야 합니다. 수입업자는 수입 식품이 안전하고 캐나다 요건을 충족함을 입증하는 PCP를 보유해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-11.html",
    topics: ["preventive_controls", "haccp", "import", "food_safety", "hazard_analysis"],
    applies_to: ["import", "production"],
    depth_level: 0,
    sort_order: 11,
  },
  {
    regulation_short_name: "SFCR",
    section_number: "Part 5 - s.59-72",
    title_en: "Traceability Requirements",
    title_ko: "추적성 요건",
    content_en:
      "Part 5 establishes traceability requirements. Section 59: All licence holders must prepare and maintain traceability documents. Section 60: Documents must identify the food commodity, the person from whom it was received, the person to whom it was provided, and the dates. This is the 'one step back, one step forward' traceability requirement. Section 64: Documents must be kept for at least 2 years. Section 67: Documents must be provided to CFIA inspectors within 24 hours on request. For imports from Korea, this means maintaining records of the Korean supplier, shipping documentation, and Canadian distribution records.",
    content_ko:
      "제5부는 추적성 요건을 수립합니다. 제59조: 모든 라이선스 보유자는 추적 문서를 작성하고 유지해야 합니다. 제60조: 문서에는 식품 상품 식별, 수령한 사람, 제공한 사람, 날짜가 포함되어야 합니다. 이것이 '한 단계 뒤, 한 단계 앞' 추적성 요건입니다. 제64조: 문서는 최소 2년간 보관해야 합니다. 제67조: 문서는 요청 시 24시간 이내에 CFIA 검사관에게 제공해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-12.html",
    topics: ["traceability", "recordkeeping", "import", "documentation"],
    applies_to: ["import", "production"],
    depth_level: 0,
    sort_order: 12,
  },
  {
    regulation_short_name: "SFCR",
    section_number: "Part 11 - s.192-217",
    title_en: "Imported Food Requirements",
    title_ko: "수입 식품 요건",
    content_en:
      "Part 11 specifically addresses imported food. Section 192: Imported food must not contain substances that exceed maximum levels set out in the Lists of Maximum Levels for Chemical Contaminants (maintained by Health Canada). Section 193: Imported food must comply with Canadian compositional standards. Section 195: The importer must ensure that imported food is prepared, manufactured, and stored in sanitary conditions. Section 196: The importer must have written evidence demonstrating that the food was prepared in a manner that ensures its safety. For imports from Korea, the Korean facility may need to be registered/listed by CFIA depending on the food type (e.g., meat, fish require establishment listing).",
    content_ko:
      "제11부는 수입 식품을 구체적으로 다룹니다. 제192조: 수입 식품은 Health Canada가 유지하는 화학 오염물질 최대 수준 목록에 설정된 최대 수준을 초과하는 물질을 포함해서는 안 됩니다. 제193조: 수입 식품은 캐나다 성분 기준을 준수해야 합니다. 제195조: 수입업자는 수입 식품이 위생적인 조건에서 준비, 제조 및 저장되었는지 확인해야 합니다. 제196조: 수입업자는 식품이 안전성을 보장하는 방식으로 준비되었음을 입증하는 서면 증거를 보유해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-29.html",
    topics: ["import", "requirements", "safety", "standards", "contaminants"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 13,
  },
  {
    regulation_short_name: "SFCR",
    section_number: "Part 11 - s.218-230",
    title_en: "Labelling of Imported Food",
    title_ko: "수입 식품의 라벨링",
    content_en:
      "Sections 218-230 detail labelling requirements for imported food. All imported prepackaged food must bear a label that includes: (a) common name of the food in English AND French (bilingual requirement), (b) net quantity in metric units, (c) name and principal place of business of the person by or for whom the food was manufactured/imported, (d) list of ingredients in descending order of proportion, (e) Nutrition Facts table compliant with Canadian format (FDR B.01.401-B.01.603), (f) allergen declarations for priority allergens (FDR B.01.010.1-B.01.010.4), (g) 'Product of [country]' statement or country of origin declaration, (h) best before date if durable life is 90 days or less, (i) storage instructions if applicable. Labels must comply with Canadian standards BEFORE the product enters Canada.",
    content_ko:
      "제218-230조는 수입 식품의 라벨링 요건을 상세히 규정합니다. 모든 수입 포장 식품에는 다음을 포함하는 라벨이 부착되어야 합니다: (a) 영어와 프랑스어로 된 식품 일반명(이중 언어 요건), (b) 미터법 단위의 순중량, (c) 식품을 제조/수입한 사람의 이름과 주요 사업장, (d) 비율 내림차순의 성분 목록, (e) 캐나다 형식을 준수하는 영양성분표, (f) 우선 알레르기 유발 물질 선언, (g) '원산지: [국가]' 표시, (h) 유통기한이 90일 이하인 경우 유통기한, (i) 해당되는 경우 보관 지침. 라벨은 제품이 캐나다에 들어오기 전에 캐나다 기준을 준수해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-31.html",
    topics: ["labeling", "import", "bilingual", "nutrition_facts", "allergens", "ingredients", "country_of_origin"],
    applies_to: ["import", "labeling"],
    depth_level: 0,
    sort_order: 14,
  },

  // ============================================
  // FOOD AND DRUGS ACT (FDA)
  // ============================================
  {
    regulation_short_name: "FDA",
    section_number: "s.4(1)",
    title_en: "Prohibition — Unsafe Food Sale",
    title_ko: "안전하지 않은 식품 판매 금지",
    content_en:
      "No person shall sell an article of food that: (a) has in or on it any poisonous or harmful substance; (b) is unfit for human consumption; (c) consists in whole or in part of any filthy, putrid, disgusting, rotten, decomposed or diseased animal or vegetable substance; (d) is adulterated; or (e) was manufactured, prepared, preserved, packaged or stored under unsanitary conditions. This is the foundational food safety prohibition in Canadian law, carrying potential criminal penalties.",
    content_ko:
      "어떤 사람도 다음에 해당하는 식품을 판매할 수 없습니다: (a) 독성 또는 유해 물질이 포함된 식품; (b) 인간 소비에 부적합한 식품; (c) 더럽거나 부패하거나 역겨운 동물 또는 식물 물질로 구성된 식품; (d) 불순물이 섞인 식품; (e) 비위생적인 조건에서 제조, 준비, 보존, 포장 또는 저장된 식품. 이것은 캐나다 법률의 기본적인 식품 안전 금지 조항으로, 형사 처벌의 가능성이 있습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/f-27/page-2.html#h-233959",
    topics: ["safety", "prohibition", "adulteration", "sanitation"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 20,
  },
  {
    regulation_short_name: "FDA",
    section_number: "s.5(1)",
    title_en: "Prohibition — Labelling and Advertising",
    title_ko: "라벨링 및 광고 금지",
    content_en:
      "No person shall label, package, treat, process, sell or advertise any food in a manner that is false, misleading or deceptive or is likely to create an erroneous impression regarding its character, value, quantity, composition, merit or safety. This section works alongside SFCA s.9 and applies to all food sold in Canada, whether produced domestically or imported.",
    content_ko:
      "어떤 사람도 식품의 성격, 가치, 수량, 구성, 장점 또는 안전성에 관하여 허위, 오해의 소지가 있거나 기만적이거나 잘못된 인상을 줄 수 있는 방식으로 식품을 라벨링, 포장, 처리, 가공, 판매 또는 광고할 수 없습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/f-27/page-2.html#h-233974",
    topics: ["labeling", "advertising", "deception", "claims"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 21,
  },
  {
    regulation_short_name: "FDA",
    section_number: "s.6",
    title_en: "Food Standards",
    title_ko: "식품 기준",
    content_en:
      "Where a standard has been prescribed for a food, no person shall label, package, sell or advertise any article in such a manner that it is likely to be mistaken for such food, unless the article complies with the prescribed standard. Food standards are set out in the Food and Drug Regulations (FDR) Division B. This includes compositional standards for specific food categories like dairy, meat, bakery products, etc.",
    content_ko:
      "식품에 대한 기준이 규정된 경우, 해당 기사가 규정된 기준을 준수하지 않는 한, 어떤 사람도 해당 식품으로 오인될 수 있는 방식으로 물품을 라벨링, 포장, 판매 또는 광고할 수 없습니다. 식품 기준은 식품의약품 규정(FDR) B부에 규정되어 있습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/f-27/page-2.html#h-233981",
    topics: ["standards", "labeling", "compositional_standards"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 22,
  },

  // ============================================
  // FOOD AND DRUG REGULATIONS (FDR)
  // ============================================
  {
    regulation_short_name: "FDR",
    section_number: "B.01.001-B.01.003",
    title_en: "General Labelling Requirements",
    title_ko: "일반 라벨링 요건",
    content_en:
      "Division 1 of Part B establishes general labelling requirements for all food sold in Canada. B.01.001: Definitions of key labelling terms. B.01.002: Every prepackaged product must show on the label: (a) the common name, (b) net quantity declaration, (c) dealer name and address, (d) list of ingredients. B.01.003: All mandatory label information must appear in both English and French (bilingual requirement under CPLA). For imported food from Korea, this means Korean-only labels are NOT acceptable - all mandatory information must be in English and French.",
    content_ko:
      "B부 제1분과는 캐나다에서 판매되는 모든 식품에 대한 일반 라벨링 요건을 수립합니다. B.01.002: 모든 포장 제품의 라벨에는 (a) 일반명, (b) 순중량 표시, (c) 판매자 이름과 주소, (d) 성분 목록이 표시되어야 합니다. B.01.003: 모든 필수 라벨 정보는 영어와 프랑스어로 표시되어야 합니다. 한국에서 수입된 식품의 경우, 한국어만으로 된 라벨은 허용되지 않으며 모든 필수 정보가 영어와 프랑스어로 되어야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/page-2.html",
    topics: ["labeling", "bilingual", "requirements", "common_name", "net_quantity", "ingredients"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 30,
  },
  {
    regulation_short_name: "FDR",
    section_number: "B.01.008-B.01.010.4",
    title_en: "Ingredient Lists and Allergen Declarations",
    title_ko: "성분 목록 및 알레르기 유발 물질 선언",
    content_en:
      "B.01.008: Ingredients must be listed in descending order of proportion by weight. B.01.008.2: Components of ingredients must be listed. B.01.009: Common names of ingredients must be used. B.01.010.1: Priority allergens must be declared. Canada's priority allergens include: eggs, milk, mustard, peanuts, crustaceans and molluscs, fish, sesame seeds, soy, sulphites (10+ ppm), tree nuts, wheat and triticale. B.01.010.3: Allergens must be declared using specific prescribed names. B.01.010.4: A 'Contains' statement is required listing all priority allergens present. This is CRITICAL for Korean food imports which commonly contain soy, sesame, and shellfish.",
    content_ko:
      "B.01.008: 성분은 중량 비율의 내림차순으로 나열해야 합니다. B.01.010.1: 우선 알레르기 유발 물질을 선언해야 합니다. 캐나다의 우선 알레르기 유발 물질: 계란, 우유, 겨자, 땅콩, 갑각류 및 연체동물, 생선, 참깨, 대두, 아황산염(10+ppm), 견과류, 밀 및 트리티케일. B.01.010.4: 모든 우선 알레르기 유발 물질을 나열하는 '포함' 문구가 필요합니다. 대두, 참깨, 조개류가 자주 포함되는 한국 식품 수입에 매우 중요합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/page-4.html",
    topics: ["ingredients", "allergens", "labeling", "priority_allergens", "soy", "sesame", "shellfish"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 31,
  },
  {
    regulation_short_name: "FDR",
    section_number: "B.01.401-B.01.603",
    title_en: "Nutrition Facts Table (NFt)",
    title_ko: "영양성분표 (NFt)",
    content_en:
      "These sections establish the Canadian Nutrition Facts table requirements. B.01.401: A Nutrition Facts table must appear on the label of most prepackaged products. B.01.402: The NFt must include: Calories, Fat (saturated, trans), Cholesterol, Sodium, Carbohydrate (fibre, sugars), Protein, Vitamin D, Calcium, Iron, Potassium, and % Daily Value. B.01.450-B.01.467: Specify the format, font size, and presentation of the NFt. The Canadian NFt format is DIFFERENT from Korean, US, and EU formats. Imported food from Korea must have a Canadian-format NFt, not the Korean format. Serving sizes must follow the Canadian Reference Amounts (Schedule M of SFCR). B.01.603: Exemptions from NFt include very small packages, fresh fruits and vegetables, and certain other categories.",
    content_ko:
      "이 조항들은 캐나다 영양성분표 요건을 수립합니다. B.01.401: 대부분의 포장 제품 라벨에 영양성분표가 표시되어야 합니다. B.01.402: NFt에는 칼로리, 지방(포화, 트랜스), 콜레스테롤, 나트륨, 탄수화물(식이섬유, 당류), 단백질, 비타민D, 칼슘, 철분, 칼륨 및 %일일 섭취량이 포함되어야 합니다. 캐나다 NFt 형식은 한국, 미국, EU 형식과 다릅니다. 한국에서 수입된 식품에는 한국 형식이 아닌 캐나다 형식의 NFt가 있어야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/page-14.html",
    topics: ["nutrition_facts", "labeling", "nft", "daily_value", "serving_size"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 32,
  },
  {
    regulation_short_name: "FDR",
    section_number: "B.01.301-B.01.305",
    title_en: "Food Additives",
    title_ko: "식품 첨가물",
    content_en:
      "B.01.301: No person shall sell a food that contains a food additive unless the additive is listed in the Lists of Permitted Food Additives (Health Canada Marketing Authorizations). These lists specify which additives are allowed, in which foods, and at what maximum levels. B.01.303: Food additives must be declared on the label. For Korean food imports, this is critical because some additives permitted in Korea may NOT be permitted in Canada (and vice versa). The importer must verify that every additive in the Korean product appears on Canada's permitted lists. Health Canada maintains the Lists of Permitted Food Additives as marketing authorizations.",
    content_ko:
      "B.01.301: 어떤 사람도 첨가물이 허가된 식품 첨가물 목록에 등재되어 있지 않는 한, 식품 첨가물이 포함된 식품을 판매할 수 없습니다. 한국 식품 수입에 있어 이것은 매우 중요한데, 한국에서 허용되는 일부 첨가물이 캐나다에서는 허용되지 않을 수 있기 때문입니다. 수입업자는 한국 제품의 모든 첨가물이 캐나다의 허가 목록에 있는지 확인해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/page-10.html",
    topics: ["additives", "permitted_additives", "labeling", "health_canada"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 33,
  },
  {
    regulation_short_name: "FDR",
    section_number: "Division 15 - B.15.001-B.15.002",
    title_en: "Adulteration of Food",
    title_ko: "식품 불순물",
    content_en:
      "B.15.001: Sets maximum residue limits (MRLs) for pesticide residues in food. B.15.002: References the Maximum Residue Limits for Pesticides maintained by Health Canada (PMRL database). Imported food must comply with Canadian MRLs, which may differ from Korean MRLs. If a pesticide residue is detected above the Canadian MRL, the food cannot be sold in Canada. Health Canada's Pest Management Regulatory Agency (PMRA) sets these limits.",
    content_ko:
      "B.15.001: 식품 내 농약 잔류물의 최대 잔류 한도(MRL)를 설정합니다. 수입 식품은 한국 MRL과 다를 수 있는 캐나다 MRL을 준수해야 합니다. 캐나다 MRL을 초과하는 농약 잔류물이 검출되면 해당 식품은 캐나다에서 판매할 수 없습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/page-89.html",
    topics: ["pesticides", "mrl", "contaminants", "safety", "residues"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 34,
  },

  // ============================================
  // CONSUMER PACKAGING AND LABELLING ACT (CPLA)
  // ============================================
  {
    regulation_short_name: "CPLA",
    section_number: "s.6",
    title_en: "Bilingual Labelling Requirement",
    title_ko: "이중 언어 라벨링 요건",
    content_en:
      "No dealer shall sell, import into Canada or advertise any prepackaged product unless all mandatory label information is shown in both English and French. This is one of the most important requirements for Korean food imports. The common name, ingredient list, net quantity, allergen declarations, and all other mandatory information must appear in BOTH English and French. Korean text alone or Korean with only English is NOT sufficient. Certain exemptions exist for products sold exclusively in specific linguistic regions, but these are narrow and rarely apply to imported products.",
    content_ko:
      "어떤 판매자도 모든 필수 라벨 정보가 영어와 프랑스어 모두로 표시되지 않는 한 포장 제품을 판매, 캐나다로 수입 또는 광고할 수 없습니다. 이것은 한국 식품 수입에 가장 중요한 요건 중 하나입니다. 일반명, 성분 목록, 순중량, 알레르기 유발 물질 선언 및 기타 모든 필수 정보가 영어와 프랑스어 모두로 표시되어야 합니다. 한국어만 또는 한국어와 영어만으로는 충분하지 않습니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/c-38/page-2.html#h-113254",
    topics: ["bilingual", "labeling", "english", "french", "requirement"],
    applies_to: ["import", "labeling"],
    depth_level: 0,
    sort_order: 40,
  },
  {
    regulation_short_name: "CPLA",
    section_number: "s.7",
    title_en: "Net Quantity Declaration",
    title_ko: "순중량 표시",
    content_en:
      "All prepackaged products must have a net quantity declaration in metric units (grams, kilograms, millilitres, litres). The declaration must be in both English and French. The type size of the net quantity declaration depends on the principal display panel area. For Korean imports, products labelled in grams/millilitres (Korean standard) will need the metric unit on the Canadian label. The net quantity must be accurate within the tolerances set out in the Weights and Measures Act.",
    content_ko:
      "모든 포장 제품에는 미터법 단위(그램, 킬로그램, 밀리리터, 리터)의 순중량 표시가 있어야 합니다. 표시는 영어와 프랑스어로 되어야 합니다. 한국 수입품의 경우, 그램/밀리리터(한국 표준)로 라벨이 붙은 제품은 캐나다 라벨에 미터법 단위가 필요합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/c-38/page-2.html#h-113260",
    topics: ["net_quantity", "labeling", "metric", "packaging"],
    applies_to: ["import", "labeling"],
    depth_level: 0,
    sort_order: 41,
  },

  // ============================================
  // CUSTOMS TARIFF / CKFTA
  // ============================================
  {
    regulation_short_name: "CKFTA",
    section_number: "Schedule - Tariff Elimination",
    title_en: "Canada-Korea Free Trade Agreement Tariff Benefits",
    title_ko: "한-캐 자유무역협정 관세 혜택",
    content_en:
      "The Canada-Korea Free Trade Agreement (CKFTA), in effect since January 1, 2015, provides preferential tariff rates for qualifying food products imported from Korea. Key provisions: (1) Many processed food products enjoy reduced or eliminated tariffs, (2) To qualify, products must meet Rules of Origin requirements (the product must be substantially manufactured in Korea), (3) A Certificate of Origin is required to claim preferential tariff treatment, (4) The tariff reduction schedule is phased - some tariffs are eliminated immediately, others are reduced over 5-15 years. Importers should check the Canada Customs Tariff Schedule for the specific HS code of their product to determine the applicable CKFTA tariff rate.",
    content_ko:
      "2015년 1월 1일부터 발효된 한-캐 자유무역협정(CKFTA)은 한국에서 수입되는 적격 식품에 대해 특혜 관세율을 제공합니다. 주요 조항: (1) 많은 가공식품이 인하 또는 철폐된 관세를 적용받음, (2) 자격을 갖추려면 원산지 규정 요건을 충족해야 함, (3) 특혜 관세를 받으려면 원산지 증명서가 필요, (4) 관세 인하 일정은 단계적임.",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/C-1.65/",
    topics: ["tariff", "trade_agreement", "korea", "import", "certificate_of_origin", "duties"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 50,
  },
  {
    regulation_short_name: "CTA",
    section_number: "Schedule - HS Classification",
    title_en: "Customs Tariff Classification for Food",
    title_ko: "식품 관세 분류",
    content_en:
      "All imported food must be classified under the Harmonized System (HS) for tariff purposes. Common HS chapters for Korean food imports: Chapter 02 (Meat), Chapter 03 (Fish/seafood), Chapter 04 (Dairy), Chapter 07 (Vegetables), Chapter 08 (Fruit), Chapter 09 (Spices - including gochugaru/Korean chili flakes), Chapter 16 (Prepared meat/fish - including kimchi jjigae), Chapter 18 (Cocoa/chocolate), Chapter 19 (Cereal preparations - including instant noodles/ramyeon), Chapter 20 (Prepared vegetables - including kimchi), Chapter 21 (Miscellaneous food preparations - including gochujang, doenjang, ssamjang), Chapter 22 (Beverages - including soju, makgeolli). The correct HS classification determines the duty rate and any applicable CKFTA preferential rate.",
    content_ko:
      "모든 수입 식품은 관세 목적으로 HS 코드로 분류되어야 합니다. 한국 식품 수입의 주요 HS 장: 제2장(육류), 제3장(수산물), 제9장(양념류 - 고추가루 포함), 제16장(가공 육류/수산물), 제19장(곡물 가공품 - 라면 포함), 제20장(가공 채소류 - 김치 포함), 제21장(기타 식품 - 고추장, 된장, 쌈장 포함), 제22장(음료 - 소주, 막걸리 포함).",
    section_url: "https://laws-lois.justice.gc.ca/eng/acts/c-54.011/",
    topics: ["tariff", "hs_code", "classification", "duties", "import"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 51,
  },

  // ============================================
  // NATURAL HEALTH PRODUCTS
  // ============================================
  {
    regulation_short_name: "NHPR",
    section_number: "s.4-6",
    title_en: "Natural Health Product Licensing",
    title_ko: "천연건강제품 라이선스",
    content_en:
      "If a Korean food product makes health claims or contains medicinal ingredients (e.g., ginseng supplements, red ginseng extracts, certain traditional Korean health foods), it may be classified as a Natural Health Product (NHP) in Canada rather than a food. NHPs require: (1) a Natural Product Number (NPN) issued by Health Canada before sale, (2) site licence for the importer/distributor, (3) compliance with NHP-specific labelling including recommended dose, risk information, and medicinal ingredient list. Key Korean products that may fall under NHP: red ginseng (홍삼) products with health claims, propolis extracts, certain mushroom extracts (상황버섯, 차가버섯). Products marketed solely as food without health claims typically remain under food regulations.",
    content_ko:
      "한국 식품이 건강 주장을 하거나 약용 성분을 포함하는 경우(예: 인삼 보충제, 홍삼 추출물, 특정 전통 건강 식품), 캐나다에서 식품이 아닌 천연건강제품(NHP)으로 분류될 수 있습니다. NHP에는 다음이 필요합니다: (1) 판매 전 Health Canada가 발급하는 천연제품번호(NPN), (2) 수입업자/유통업자의 사이트 라이선스, (3) 권장 용량, 위험 정보, 약용 성분 목록을 포함한 NHP 전용 라벨링. NHP에 해당할 수 있는 주요 한국 제품: 건강 주장이 있는 홍삼 제품, 프로폴리스 추출물, 특정 버섯 추출물.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2003-196/page-1.html",
    topics: ["nhp", "health_claims", "ginseng", "licensing", "natural_health_products"],
    applies_to: ["import", "production", "labeling"],
    depth_level: 0,
    sort_order: 60,
  },

  // ============================================
  // CFIA GUIDANCE - IMPORT PROCESS
  // ============================================
  {
    regulation_short_name: "AIRS",
    section_number: "Import Process Overview",
    title_en: "CFIA Import Process for Food from Korea",
    title_ko: "한국에서의 식품 수입을 위한 CFIA 수입 절차",
    content_en:
      "Step-by-step process for importing food from Korea into Canada: (1) Obtain SFC licence through My CFIA portal (free, online application). (2) Develop a Preventive Control Plan (PCP) that addresses food safety hazards. (3) Check AIRS (Automated Import Reference System) for commodity-specific import requirements - enter the HS code to find specific requirements for your product. (4) Ensure Korean supplier meets Canadian food safety standards. (5) Arrange for bilingual (English/French) labels that comply with all Canadian requirements. (6) Submit import documentation to CBSA including: commercial invoice, bill of lading, packing list, Certificate of Origin (if claiming CKFTA tariff preference), any required health/sanitary certificates. (7) Product may be subject to CFIA inspection at point of entry. (8) If inspected, CFIA may sample for laboratory analysis (contaminants, additives, labelling verification). (9) Upon release by CBSA, maintain all traceability records for minimum 2 years.",
    content_ko:
      "한국에서 캐나다로 식품을 수입하는 단계별 과정: (1) My CFIA 포털을 통해 SFC 라이선스 획득(무료, 온라인 신청). (2) 식품 안전 위험을 다루는 예방관리계획(PCP) 개발. (3) AIRS에서 상품별 수입 요건 확인. (4) 한국 공급업체가 캐나다 식품 안전 기준을 충족하는지 확인. (5) 캐나다 요건을 준수하는 이중 언어(영어/프랑스어) 라벨 준비. (6) CBSA에 수입 서류 제출. (7) 입국 지점에서 CFIA 검사 대상이 될 수 있음. (8) 검사 시 실험실 분석을 위한 샘플링 가능. (9) CBSA 통관 후 최소 2년간 추적 기록 유지.",
    section_url: "https://airs-sari.inspection.gc.ca/",
    topics: ["import_process", "step_by_step", "korea", "sfc_licence", "pcp", "inspection"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 70,
  },
  {
    regulation_short_name: "PCP-GUIDE",
    section_number: "PCP for Importers",
    title_en: "Preventive Control Plan Requirements for Importers",
    title_ko: "수입업자를 위한 예방관리계획 요건",
    content_en:
      "A Preventive Control Plan (PCP) for food importers must include: (1) PROCESS CONTROLS: Description of how the foreign supplier ensures food safety during manufacturing. (2) SANITATION CONTROLS: Evidence that the foreign facility maintains sanitary conditions. (3) PEST CONTROL: Evidence of pest management at the foreign facility. (4) EMPLOYEE HYGIENE: Evidence that workers follow hygiene practices. (5) HAZARD ANALYSIS: Identification of biological hazards (Salmonella, Listeria, E. coli), chemical hazards (allergens, pesticide residues, heavy metals, food additives), and physical hazards (foreign objects). (6) CRITICAL CONTROL POINTS: Points where hazards can be prevented, eliminated, or reduced. (7) MONITORING: How the importer verifies that the foreign supplier is meeting these requirements. (8) CORRECTIVE ACTIONS: What happens when a deviation occurs. (9) VERIFICATION: Regular review and audit of the PCP. (10) TRACEABILITY: System to trace the food from Korean supplier through Canadian distribution. The PCP must be written, kept current, and available to CFIA inspectors on request.",
    content_ko:
      "식품 수입업자를 위한 예방관리계획(PCP)에는 다음이 포함되어야 합니다: (1) 공정 관리: 외국 공급업체가 제조 중 식품 안전을 보장하는 방법. (2) 위생 관리: 외국 시설의 위생 조건 유지 증거. (3) 해충 관리. (4) 직원 위생. (5) 위해 분석: 생물학적 위해(살모넬라, 리스테리아, 대장균), 화학적 위해(알레르기 유발 물질, 농약 잔류물, 중금속, 식품 첨가물), 물리적 위해(이물질) 식별. (6) 중요 관리점. (7) 모니터링. (8) 시정 조치. (9) 검증. (10) 추적성: 한국 공급업체에서 캐나다 유통까지의 식품 추적 시스템.",
    section_url: "https://inspection.canada.ca/preventive-controls/",
    topics: ["pcp", "preventive_controls", "haccp", "import", "food_safety", "hazard_analysis"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 71,
  },
  {
    regulation_short_name: "CFIA-LABEL-GUIDE",
    section_number: "Core Labelling Requirements",
    title_en: "Summary of All Mandatory Label Elements",
    title_ko: "모든 필수 라벨 요소 요약",
    content_en:
      "Complete list of mandatory label elements for prepackaged food sold in Canada (applicable to Korean imports): (1) COMMON NAME: Must be the prescribed name or an appropriate description, in English and French. (2) NET QUANTITY: In metric units, both languages, minimum type height based on display panel size. (3) INGREDIENT LIST: Descending order by weight, both languages, using prescribed common names. (4) ALLERGEN DECLARATION: 'Contains:' statement listing all priority allergens, in both languages. (5) NUTRITION FACTS TABLE: Canadian format (NOT Korean/US/EU format), including all core nutrients, % Daily Value based on Canadian Daily Values. (6) NAME AND ADDRESS: Of the manufacturer, importer, or Canadian dealer. Must include a Canadian address. (7) COUNTRY OF ORIGIN: 'Product of Korea' or 'Made in Korea' statement. (8) BEST BEFORE DATE: If durable life is 90 days or less, in 'Year-Month-Day' format with 'Best Before / Meilleur avant' heading. (9) STORAGE INSTRUCTIONS: If required for food safety. (10) DURABLE LIFE DATE FORMAT: Must use the Canadian format. (11) GRADE NAME: If applicable under SFCR. (12) IRRADIATION SYMBOL: If food has been irradiated.",
    content_ko:
      "캐나다에서 판매되는 포장 식품의 필수 라벨 요소 전체 목록(한국 수입품에 적용): (1) 일반명: 영어와 프랑스어로 규정된 이름 또는 적절한 설명. (2) 순중량: 미터법 단위, 양쪽 언어. (3) 성분 목록: 중량 내림차순, 양쪽 언어. (4) 알레르기 유발 물질 선언: 양쪽 언어로 '포함:' 문구. (5) 영양성분표: 캐나다 형식(한국/미국/EU 형식 아님). (6) 이름과 주소: 제조업체, 수입업체 또는 캐나다 판매업체. 캐나다 주소 포함 필수. (7) 원산지: '한국산' 표시. (8) 유통기한: 90일 이하인 경우. (9) 보관 지침. (10) 등급명: 해당되는 경우. (11) 방사선 조사 표시: 해당되는 경우.",
    section_url: "https://inspection.canada.ca/food-labels/labelling/industry/",
    topics: ["labeling", "summary", "mandatory_elements", "complete_requirements"],
    applies_to: ["import", "production", "labeling"],
    depth_level: 0,
    sort_order: 72,
  },

  // ============================================
  // PRODUCTION-SPECIFIC REGULATIONS
  // ============================================
  {
    regulation_short_name: "SFCR",
    section_number: "Part 3 - s.29-46",
    title_en: "Food Production Facility Requirements",
    title_ko: "식품 생산 시설 요건",
    content_en:
      "Part 3 of SFCR establishes requirements for food manufacturing establishments in Canada. Section 29: Establishments must be licensed if they manufacture food for interprovincial trade, export, or import. Section 30: The establishment must implement and maintain a Preventive Control Plan (PCP). Section 31: The PCP must address sanitation, pest control, chemical control, receiving/shipping, equipment maintenance, and employee hygiene. Section 32-33: Food must be manufactured, prepared, packaged, labelled and stored under sanitary conditions. Section 34: Adequate water supply, waste disposal, pest control, hand washing facilities, and lighting. Section 35-38: Equipment must be designed, constructed, installed and maintained to facilitate cleaning and prevent contamination. Section 39-42: Incoming materials must be inspected and traceable. Section 43-46: Temperature control for perishable foods, proper storage conditions.",
    content_ko:
      "SFCR 제3부는 캐나다 식품 제조 시설의 요건을 수립합니다. 제29조: 시설은 주간 무역, 수출 또는 수입을 위해 식품을 제조하는 경우 라이선스를 받아야 합니다. 제30조: 시설은 예방관리계획(PCP)을 시행하고 유지해야 합니다. 제31조: PCP는 위생, 해충 관리, 화학 관리, 입출고, 장비 유지보수, 직원 위생을 다루어야 합니다. 제32-33조: 식품은 위생적인 조건에서 제조, 준비, 포장, 라벨링 및 저장되어야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-8.html",
    topics: ["production", "facility", "sanitation", "haccp", "manufacturing", "gmp"],
    applies_to: ["production"],
    depth_level: 0,
    sort_order: 80,
  },
  {
    regulation_short_name: "SFCR",
    section_number: "Part 7 - s.86-121",
    title_en: "Grade Requirements and Standards of Identity",
    title_ko: "등급 요건 및 정체성 기준",
    content_en:
      "Part 7 establishes grade requirements and standards of identity for specific food categories in Canada. These standards define what a food must contain to be sold under a particular name. Key categories with prescribed standards: (1) Dairy Products (Division 8 of FDR): butter, cheese, ice cream, yogurt must meet compositional standards. (2) Meat Products: meat content minimums, fat maximums. (3) Honey: purity requirements. (4) Maple Products: grading requirements. (5) Fresh Fruits and Vegetables: grade and quality standards. For imported products, the food must meet the Canadian standard of identity if one exists for that product category. If a Korean product doesn't meet the Canadian standard, it must be sold under a different name.",
    content_ko:
      "제7부는 캐나다의 특정 식품 카테고리에 대한 등급 요건과 정체성 기준을 수립합니다. 이 기준은 특정 이름으로 판매되기 위해 식품이 무엇을 포함해야 하는지를 정의합니다. 수입 제품의 경우, 해당 제품 카테고리에 캐나다 정체성 기준이 있다면 그 기준을 충족해야 합니다. 한국 제품이 캐나다 기준을 충족하지 못하면 다른 이름으로 판매해야 합니다.",
    section_url: "https://laws-lois.justice.gc.ca/eng/regulations/SOR-2018-108/page-16.html",
    topics: ["standards", "grades", "identity", "compositional_standards", "dairy", "meat"],
    applies_to: ["production", "import"],
    depth_level: 0,
    sort_order: 81,
  },

  // ============================================
  // ALBERTA PROVINCIAL REQUIREMENTS
  // ============================================
  {
    regulation_short_name: "AB-FOOD-REG",
    section_number: "AR 31/2006 - Food Handling Permit",
    title_en: "Alberta Food Handling Permit Requirements",
    title_ko: "알버타 식품 취급 허가 요건",
    content_en:
      "Under Alberta's Food Regulation (AR 31/2006) and the Public Health Act (RSA 2000, c. P-37), every commercial food establishment in Alberta requires a Food Handling Permit issued by Alberta Health Services (AHS), Environmental Public Health division. Requirements: (1) Application must be submitted at least 14 days before opening. (2) Permits are non-transferable. (3) A Public Health Inspector conducts an on-site inspection before permit issuance, verifying equipment, fixtures, construction completion, cleanliness. (4) After opening, routine inspections every 4-6 months. (5) When 6+ food handlers work at one time, at least one must hold a recognized food handler certification (Alberta Food Safety Basics or equivalent). (6) Facility must meet Alberta Food Retail and Foodservices Code (2020) construction requirements: durable non-absorbent floors with drains, light-coloured smooth walls/ceilings, shatterproof light covers, mechanical ventilation with stainless steel canopies, potable water only. Application: https://www.albertahealthservices.ca/eph/Page15563.aspx",
    content_ko:
      "알버타 식품 규정(AR 31/2006) 및 공중보건법(RSA 2000, c. P-37)에 따라, 알버타의 모든 상업 식품 시설은 AHS 환경공중보건부가 발급하는 식품 취급 허가가 필요합니다. 요건: (1) 개업 최소 14일 전에 신청. (2) 허가는 양도 불가. (3) 공중보건 검사관이 허가 발급 전 현장 검사 실시. (4) 개업 후 4-6개월마다 정기 검사. (5) 식품 취급자 6명 이상 동시 근무 시, 최소 1명은 공인 식품 취급자 자격증 보유 필수. (6) 시설은 알버타 식품 소매 및 식품서비스 코드(2020) 건설 요건 충족 필요.",
    section_url: "https://kings-printer.alberta.ca/documents/Regs/2006_031.pdf",
    topics: ["alberta", "provincial", "permit", "facility", "inspection", "food_handler"],
    applies_to: ["production"],
    depth_level: 0,
    sort_order: 90,
  },
  {
    regulation_short_name: "AB-FOOD-CODE",
    section_number: "Facility Construction Standards",
    title_en: "Alberta Food Manufacturing Facility Standards",
    title_ko: "알버타 식품 제조 시설 기준",
    content_en:
      "The Alberta Food Retail and Foodservices Code (2020) establishes detailed construction and operation standards for food facilities: FLOORS: Durable, smooth, non-absorbent, easily cleaned; floor drains required in processing areas. WALLS/CEILINGS: Light-coloured finish, smooth, non-absorbent, durable materials. LIGHTING: Shatterproof covers or guards on light fixtures in food preparation/processing areas. VENTILATION: Mechanical ventilation system (canopies, ductwork, fans) required where cooking occurs; canopies/hoods must be stainless steel; all exterior openings protected against vermin/dust. WATER: Only potable water may contact food during handling, processing, and cleaning. EQUIPMENT: Must be constructed from food-grade materials, durable, easily cleanable, free from undesirable substances. PEST CONTROL: Comprehensive pest management program required. WASTE: Adequate waste disposal systems. HAND WASHING: Dedicated hand washing stations with soap, hot/cold running water, and single-use towels in all food handling areas.",
    content_ko:
      "알버타 식품 소매 및 식품서비스 코드(2020)는 식품 시설의 건설 및 운영 기준을 수립합니다. 바닥: 내구성, 매끄럽고, 비흡수성, 쉽게 청소 가능; 가공 구역에 배수구 필요. 벽/천장: 밝은 색, 매끄러운 표면. 조명: 식품 준비 구역에 파손 방지 커버. 환기: 기계식 환기 시스템 필수, 스테인리스 스틸 후드. 용수: 식수 등급 물만 사용. 장비: 식품 등급 재질, 내구성, 세척 용이. 해충 관리: 종합 해충 관리 프로그램 필수. 손 씻기: 전용 세면대 필수.",
    section_url: "https://open.alberta.ca/dataset/0ea69179-2f90-4776-a64d-c903299b2ca6",
    topics: ["alberta", "facility", "construction", "sanitation", "gmp", "equipment"],
    applies_to: ["production"],
    depth_level: 0,
    sort_order: 91,
  },

  // ============================================
  // SIMULATED MEAT/POULTRY PRODUCTS
  // ============================================
  {
    regulation_short_name: "CFIA-SIM-MEAT",
    section_number: "Simulated Products - Naming",
    title_en: "Naming Requirements for Simulated Meat/Poultry Products",
    title_ko: "모조 육류/가금류 제품 명칭 요건",
    content_en:
      "CFIA's guidelines on simulated meat and simulated poultry products establish three categories for plant-based products: CATEGORY 1 - SIMULATED PRODUCTS: If the product resembles a meat or poultry product in appearance (e.g., shaped like chicken nuggets, has meat-like texture): (a) Common name MUST include the word 'simulated' (e.g., 'Simulated Chicken Nuggets'), (b) Must declare 'Contains no meat' or 'Contains no poultry' on the principal display panel in close proximity to common name in letters at least the same size and prominence, (c) Must meet minimum protein content and rating equivalent to the simulated product, (d) Must be fortified with vitamins and minerals to match nutritional profile of the simulated product. CATEGORY 2 - PLANT-BASED WITH MEAT TERMS: Terms like 'burger,' 'sausage,' 'patty' are permitted only if the food does NOT have the appearance of a meat/poultry product. CATEGORY 3 - OTHER PLANT-BASED: Products that don't resemble meat and don't use meat terminology have no simulated product requirements. IMPORTANT: 'Chick'n' as a standalone name would NOT be compliant - it must include 'simulated'. Using 'Plant-Based Chicken-Style Nuggets' without 'simulated' may also be non-compliant if the product resembles chicken nuggets in appearance.",
    content_ko:
      "CFIA의 모조 육류/가금류 가이드라인은 식물성 제품을 3개 카테고리로 분류합니다. 카테고리 1 - 모조 제품: 육류/가금류와 유사한 외관(예: 치킨 너겟 모양)의 경우: (a) 일반명에 반드시 '모조(simulated)' 포함 (예: 'Simulated Chicken Nuggets'), (b) 주 표시면에 'Contains no poultry' 선언 필수, 일반명과 같은 크기와 돋보임으로, (c) 모방하는 제품과 동등한 최소 단백질 함량 충족 필수, (d) 비타민/미네랄 강화 필수. 카테고리 2: '버거', '소시지' 등 용어는 육류와 유사하지 않은 경우에만 허용. 카테고리 3: 육류와 무관한 식물성 제품은 모조 제품 요건 없음. 중요: 'Chick'n'만으로는 규정 미준수 - 반드시 'simulated' 포함 필요.",
    section_url: "https://inspection.canada.ca/en/food-labels/labelling/industry/meat-and-poultry-products/simulated-products",
    topics: ["plant_based", "simulated_products", "naming", "labeling", "protein", "fortification"],
    applies_to: ["production", "labeling"],
    depth_level: 0,
    sort_order: 100,
  },
  {
    regulation_short_name: "CFIA-SIM-MEAT",
    section_number: "Simulated Products - Fortification",
    title_en: "Fortification Requirements for Simulated Products",
    title_ko: "모조 제품 영양 강화 요건",
    content_en:
      "When a plant-based product is classified as a simulated meat or poultry product, it must be fortified to match the nutritional profile of the product it simulates. For simulated chicken nuggets, this means: (1) PROTEIN: Must meet minimum protein content equivalent to real chicken nuggets. Protein Rating (PR) must be at least 20 per reasonable daily intake. The Protein Efficiency Ratio (PER) of the protein source must be considered. Soy protein concentrate typically has an acceptable PER. (2) VITAMINS to add: Thiamine, Riboflavin, Niacin (or Niacinamide), Pyridoxine (B6), Folic Acid, Cobalamin (B12), Pantothenic Acid. (3) MINERALS to add: Iron, Zinc. (4) All added vitamins and minerals must be declared on the Nutrition Facts table in both absolute amounts and % Daily Value. (5) The specific amounts to add should match the levels in the real product being simulated (check the Canadian Nutrient File for reference values). Failure to properly fortify a simulated product is a SFCA violation.",
    content_ko:
      "식물성 제품이 모조 육류/가금류로 분류되면, 모방하는 제품의 영양 프로필에 맞게 강화해야 합니다. 모조 치킨 너겟의 경우: (1) 단백질: 실제 치킨 너겟과 동등한 최소 단백질 함량 충족 필수. (2) 비타민 추가: 티아민, 리보플라빈, 나이아신, 피리독신(B6), 엽산, 코발라민(B12), 판토텐산. (3) 미네랄 추가: 철, 아연. (4) 모든 추가 비타민/미네랄은 영양성분표에 절대량 및 %일일섭취량으로 표시. (5) 캐나다 영양소 파일의 참조값을 참고하여 강화량 결정. 적절한 강화 없이 모조 제품을 판매하면 SFCA 위반입니다.",
    section_url: "https://inspection.canada.ca/en/food-labels/labelling/industry/meat-and-poultry-products/simulated-products",
    topics: ["plant_based", "fortification", "protein", "vitamins", "minerals", "nutrition"],
    applies_to: ["production", "labeling"],
    depth_level: 0,
    sort_order: 101,
  },

  // ============================================
  // NON-GMO LABELLING
  // ============================================
  {
    regulation_short_name: "NON-GMO-STD",
    section_number: "Non-GMO Claims",
    title_en: "Non-GMO Voluntary Labelling Requirements in Canada",
    title_ko: "캐나다 Non-GMO 자발적 표시 요건",
    content_en:
      "Canada has NO mandatory GMO labelling requirement. The voluntary national standard is CAN/CGSB-32.315 (Voluntary Labelling and Advertising of Foods That Are and Are Not Products of Genetic Engineering). Key rules for voluntary 'Non-GMO' claims: (1) ALL ingredients in a multi-ingredient product must be non-GE to make a blanket 'Non-GMO' claim. (2) CANNOT use absolute terms like 'free', '100%', or 'all' because zero cannot be guaranteed. (3) CANNOT make a non-GMO claim for a product where no GMO counterpart exists commercially (e.g., 'Non-GMO rice' is misleading). (4) Must have supporting documentation available for CFIA inspection. (5) Any claim must be truthful and not misleading under Food and Drugs Act Section 5(1). THIRD-PARTY CERTIFICATION: The Non-GMO Project Verified is the most common certification in North America. Process: select a Technical Administrator (TA), TA evaluates products, testing required for high-risk ingredients (soy and corn are HIGH-RISK), annual renewal. CanadaCerts also offers Non-GMO verification. For soy protein and soybean oil: Soy is a HIGH-RISK crop (90%+ of North American soy is GMO). Korean-sourced soy may be non-GMO, but testing and/or traceability documentation from Korean suppliers will be required for certification.",
    content_ko:
      "캐나다에는 의무적인 GMO 표시 요건이 없습니다. 자발적 표준은 CAN/CGSB-32.315입니다. 'Non-GMO' 표시 주요 규칙: (1) 다성분 제품의 모든 성분이 non-GE여야 전체 'Non-GMO' 주장 가능. (2) 'free', '100%' 등 절대적 표현 사용 불가. (3) GMO 상업 제품이 없는 식품에 non-GMO 주장 불가(오해 유발). (4) CFIA 검사를 위한 증빙 서류 구비 필수. 제3자 인증: Non-GMO Project Verified가 가장 일반적. 대두와 옥수수는 고위험 작물로 테스트 필수. 한국산 대두는 non-GMO일 수 있으나, 인증을 위해 한국 공급업체의 추적 서류가 필요합니다.",
    section_url: "https://inspection.canada.ca/en/food-labels/labelling/consumers/genetically-engineered-foods",
    topics: ["non_gmo", "labeling", "claims", "certification", "soy", "voluntary"],
    applies_to: ["production", "labeling"],
    depth_level: 0,
    sort_order: 110,
  },

  // ============================================
  // ORGANIC CERTIFICATION
  // ============================================
  {
    regulation_short_name: "COR",
    section_number: "Organic Certification Requirements",
    title_en: "Canada Organic Regime (COR) Certification",
    title_ko: "캐나다 유기 인증 제도 (COR)",
    content_en:
      "The Canada Organic Regime (COR) is governed by SFCR Part 13 and Canadian Organic Standards CAN/CGSB-32.310 and CAN/CGSB-32.311. WHEN CERTIFICATION IS REQUIRED: Mandatory if product bears Canada Organic logo OR makes organic claim AND is sold interprovincially/internationally. MULTI-INGREDIENT LABELLING: 95-100% organic content = may label as 'Organic [product]', may use Canada Organic logo, certification required. 70-95% organic = may state 'X% organic ingredients', must name CB, NO logo allowed, certification required. Below 70% = may ONLY identify specific organic ingredients in ingredient list, NO logo, NO certification required. CERTIFICATION PROCESS: Must use a CFIA-accredited Certification Body (CB). CBs must comply with ISO/IEC 17065. Initial certification fee: $300-$2,000+. Timeline for processors: approximately 3-4 months. Annual renewal required. IMPORTED ORGANIC INGREDIENTS FROM KOREA: Korea's organic certification has an equivalency arrangement with Canada. Korean organic certificates are accepted. Your Canadian facility must also be certified organic to make organic claims on finished product. Canada Organic logo: only on 95%+ organic, certified products, must show CB name.",
    content_ko:
      "캐나다 유기 인증 제도(COR)는 SFCR 제13부와 캐나다 유기 표준에 의해 규율됩니다. 인증 필요 시기: 캐나다 유기 로고 사용 시 또는 유기 주장을 하며 주간/국제 판매 시 필수. 다성분 제품: 95-100% 유기 = '유기농' 표시 가능, 로고 사용 가능. 70-95% = 'X% 유기 성분' 표시 가능, 로고 불가. 70% 미만 = 성분 목록에만 유기 표시 가능. 인증 절차: CFIA 공인 인증 기관 사용 필수. 초기 비용: $300-$2,000+. 기간: 약 3-4개월. 한국 유기 성분: 한국 유기 인증은 캐나다와 동등성 협정 체결, 한국 유기 증명서 인정됨.",
    section_url: "https://inspection.canada.ca/en/food-labels/organic-products/regulating",
    topics: ["organic", "certification", "labeling", "cor", "logo", "equivalency"],
    applies_to: ["production", "import", "labeling"],
    depth_level: 0,
    sort_order: 120,
  },

  // ============================================
  // VEGAN / PLANT-BASED CLAIMS
  // ============================================
  {
    regulation_short_name: "CFIA-SIM-MEAT",
    section_number: "Vegan and Plant-Based Claims",
    title_en: "Vegan and Plant-Based Labelling Claims in Canada",
    title_ko: "캐나다의 비건 및 식물성 표시 주장",
    content_en:
      "LEGAL STATUS: Vegan certification is entirely voluntary in Canada. There is no Canadian law requiring certification to use 'vegan' or 'plant-based' on a food label. However, all claims must be truthful and not misleading under Food and Drugs Act Section 5(1). If CFIA inspects and you claim 'vegan', you must substantiate the claim (demonstrate no animal-derived ingredients or processing aids). RECOGNIZED CERTIFICATION BODIES: (1) The Vegan Society (UK) - oldest, globally recognized. (2) BeVeg International (US) - only ISO 17065/17067 accredited vegan certification, includes animal allergen controls. (3) Vegan Action / Vegan Awareness Foundation - widely used in North America. (4) Vegan Society of Canada - Canadian-focused. (5) CanadaCerts Vegan - Canadian certification. 'VEGAN' vs 'PLANT-BASED': 'Vegan' = no animal products/by-products including in processing. Best practice: obtain third-party certification. 'Plant-Based' = broader, less defined term. No regulatory definition in Canada. Can be used more freely but must be truthful. CFIA treats this as a composition claim that must be substantiated. Neither claim requires government approval, but both must be supportable if challenged during CFIA inspection.",
    content_ko:
      "법적 상태: 비건 인증은 캐나다에서 완전히 자발적입니다. '비건' 또는 '식물성'이라는 표시를 위해 인증이 법적으로 필요하지 않습니다. 그러나 모든 주장은 식품의약품법 제5(1)조에 따라 진실되고 오해의 소지가 없어야 합니다. 인정되는 인증 기관: (1) The Vegan Society (영국), (2) BeVeg International - 유일한 ISO 17065/17067 인증 비건 인증, (3) Vegan Action, (4) Vegan Society of Canada, (5) CanadaCerts Vegan. '비건' vs '식물성': '비건' = 동물성 제품/부산물 없음, 인증 권장. '식물성' = 더 넓은 개념, 캐나다에서 규제 정의 없음, 입증 가능해야 함.",
    section_url: "https://inspection.canada.ca/en/food-labels/labelling/industry/meat-and-poultry-products/simulated-products",
    topics: ["vegan", "plant_based", "certification", "labeling", "claims", "voluntary"],
    applies_to: ["production", "labeling"],
    depth_level: 0,
    sort_order: 130,
  },

  // ============================================
  // INGREDIENT-SPECIFIC IMPORT (Korean Ingredients)
  // ============================================
  {
    regulation_short_name: "AIRS",
    section_number: "Korean Ingredient HS Codes",
    title_en: "HS Code Classification for Korean Food Ingredients",
    title_ko: "한국산 식품 원료의 HS 코드 분류",
    content_en:
      "Specific HS codes for common Korean food ingredients imported to Canada: (1) Soy protein concentrate: 2106.10 (protein concentrates/textured protein substances), sub-code 2106.10.20. (2) Soybean oil (refined, Non-GMO): 1507.90 (refined soybean oil). (3) Rice syrup: 1702.90 (other sugars) or 1702.30 (glucose/glucose syrup) depending on composition. (4) Gochujang (red pepper paste): 2103.90 (other sauces/preparations; mixed condiments). Per CBSA Memorandum D10-14-35 on tariff classification of sauces. (5) Red pepper powder (gochugaru): 0904.22 (fruits of genus Capsicum, dried, crushed or ground). (6) Wheat flour: 1101 (wheat or meslin flour). (7) Cornstarch: 1108.12 (corn/maize starch). (8) Cane sugar: 1701.14 (other cane sugar). (9) Fermented soybean powder: 2106.90 (food preparations not elsewhere specified). (10) Tomato paste: 2002.90 (tomatoes prepared/preserved). (11) Apple/Pear juice concentrate: 2009.79/2009.89 (fruit juice concentrates). Use Canada Tariff Finder (tariffinder.ca) to verify CKFTA preferential rates for each code. Certificate of Origin from Korean exporter required to claim CKFTA preferential rates.",
    content_ko:
      "한국산 식품 원료의 주요 HS 코드: (1) 대두단백 농축물: 2106.10. (2) 대두유(정제): 1507.90. (3) 쌀 시럽: 1702.90 또는 1702.30. (4) 고추장: 2103.90. (5) 고춧가루: 0904.22. (6) 밀가루: 1101. (7) 옥수수전분: 1108.12. (8) 사탕수수 설탕: 1701.14. (9) 발효 콩가루: 2106.90. (10) 토마토 페이스트: 2002.90. (11) 사과/배 농축액: 2009.79/2009.89. CKFTA 특혜 관세를 받으려면 한국 수출업체의 원산지 증명서 필요.",
    section_url: "https://www.tariffinder.ca/en/",
    topics: ["import", "hs_code", "korea", "ingredients", "tariff", "ckfta"],
    applies_to: ["import"],
    depth_level: 0,
    sort_order: 140,
  },
] as const;
