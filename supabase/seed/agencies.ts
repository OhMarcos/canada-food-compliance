/**
 * Canadian Regulatory Agencies - Seed Data
 *
 * Covers both Food and Natural Health Product (NHP) regulatory bodies.
 * Food: CFIA, HC, CBSA, CB, MC, etc.
 * NHP: NNHPD, MHPD, HPFBI (all under Health Canada)
 */

export const AGENCIES = [
  {
    name_en: "Canadian Food Inspection Agency",
    name_ko: "캐나다 식품검사청",
    acronym: "CFIA",
    website_url: "https://inspection.canada.ca/",
    jurisdiction: "federal",
    description_en:
      "Primary federal agency responsible for food safety, animal health, and plant protection. Administers the Safe Food for Canadians Act (SFCA) and its regulations. Oversees food import inspections, licensing, and compliance verification.",
    description_ko:
      "캐나다의 주요 연방 기관으로 식품 안전, 동물 건강, 식물 보호를 담당합니다. 캐나다 안전식품법(SFCA)과 그 규정을 관리하며, 식품 수입 검사, 라이선스, 컴플라이언스 검증을 감독합니다.",
  },
  {
    name_en: "Health Canada",
    name_ko: "캐나다 보건부",
    acronym: "HC",
    website_url: "https://www.canada.ca/en/health-canada.html",
    jurisdiction: "federal",
    description_en:
      "Sets food safety standards, establishes maximum residue limits for contaminants and additives, approves food additives and novel foods, and establishes nutritional labelling requirements under the Food and Drugs Act.",
    description_ko:
      "식품 안전 기준을 설정하고, 오염물질 및 첨가물의 최대 잔류 한도를 설정하며, 식품 첨가물과 신규 식품을 승인하고, 식품의약품법에 따른 영양 표시 요건을 수립합니다.",
  },
  {
    name_en: "Canada Border Services Agency",
    name_ko: "캐나다 국경서비스청",
    acronym: "CBSA",
    website_url: "https://www.cbsa-asfc.gc.ca/",
    jurisdiction: "federal",
    description_en:
      "Manages Canada's borders. Responsible for customs clearance of imported food products, tariff classification, duties collection, and enforcing import prohibitions. Works with CFIA for food import inspections at points of entry.",
    description_ko:
      "캐나다 국경을 관리합니다. 수입 식품의 통관, 관세 분류, 관세 징수, 수입 금지 집행을 담당하며, 입국 지점에서 CFIA와 협력하여 식품 수입 검사를 수행합니다.",
  },
  {
    name_en: "Competition Bureau Canada",
    name_ko: "캐나다 경쟁국",
    acronym: "CB",
    website_url: "https://www.competitionbureau.gc.ca/",
    jurisdiction: "federal",
    description_en:
      "Enforces the Consumer Packaging and Labelling Act (CPLA) for non-food aspects. Ensures packaging and labelling of consumer products, including food, does not contain false or misleading representations.",
    description_ko:
      "소비자 포장 및 라벨링법(CPLA)의 비식품 측면을 집행합니다. 식품을 포함한 소비자 제품의 포장 및 라벨링이 허위 또는 오해의 소지가 있는 표현을 포함하지 않도록 합니다.",
  },
  {
    name_en: "Measurement Canada",
    name_ko: "캐나다 측정국",
    acronym: "MC",
    website_url: "https://ised-isde.canada.ca/site/measurement-canada/en",
    jurisdiction: "federal",
    description_en:
      "Ensures accuracy of net quantity declarations on food products under the Weights and Measures Act. Responsible for measurement standards in trade.",
    description_ko:
      "도량형법에 따라 식품 제품의 순중량 표시의 정확성을 보장합니다. 무역에서의 측정 표준을 담당합니다.",
  },
  {
    name_en: "Ministry of Food and Drug Safety (Korea)",
    name_ko: "식품의약품안전처",
    acronym: "MFDS",
    website_url: "https://www.mfds.go.kr/",
    jurisdiction: "international",
    description_en:
      "Korea's food safety authority. Relevant for Korean export certificates, health certificates, and compliance documentation required by CFIA for food imports from Korea.",
    description_ko:
      "한국의 식품 안전 당국입니다. CFIA가 한국으로부터의 식품 수입에 요구하는 한국 수출 증명서, 건강 증명서 및 적합성 서류와 관련이 있습니다.",
  },
  {
    name_en: "Global Affairs Canada",
    name_ko: "캐나다 글로벌 어페어즈",
    acronym: "GAC",
    website_url: "https://www.international.gc.ca/",
    jurisdiction: "federal",
    description_en:
      "Manages international trade agreements including the Canada-Korea Free Trade Agreement (CKFTA) which affects tariff rates on food imports from Korea.",
    description_ko:
      "한국으로부터의 식품 수입 관세율에 영향을 미치는 한-캐 자유무역협정(CKFTA)을 포함한 국제 무역 협정을 관리합니다.",
  },
  {
    name_en: "Alberta Health Services",
    name_ko: "알버타 보건서비스",
    acronym: "AHS",
    website_url: "https://www.albertahealthservices.ca/",
    jurisdiction: "provincial",
    description_en:
      "Alberta's provincial health authority. Issues Food Handling Permits for food establishments in Alberta through the Environmental Public Health division. Conducts routine inspections every 4-6 months.",
    description_ko:
      "알버타 주의 보건 당국입니다. 환경공중보건부를 통해 알버타 내 식품 시설에 식품 취급 허가를 발급합니다. 4-6개월마다 정기 점검을 실시합니다.",
  },
  // ============================================
  // NHP-SPECIFIC AGENCIES (under Health Canada)
  // ============================================
  {
    name_en: "Natural and Non-prescription Health Products Directorate",
    name_ko: "천연 및 비처방 건강제품국",
    acronym: "NNHPD",
    website_url: "https://www.canada.ca/en/health-canada/corporate/about-health-canada/branches-agencies/health-products-food-branch/natural-non-prescription-health-products-directorate.html",
    jurisdiction: "federal",
    description_en:
      "Primary regulator for Natural Health Products (NHPs) in Canada. Issues product licences (NPN/DIN-HM), site licences, oversees GMP compliance, and manages the Compendium of Monographs. Operates under Health Canada's Health Products and Food Branch.",
    description_ko:
      "캐나다 천연건강제품(NHP)의 주요 규제 기관. 제품 라이선스(NPN/DIN-HM) 발급, 시설 라이선스, GMP 준수 감독, 모노그래프 편람 관리를 담당합니다. Health Canada 산하 건강제품식품분과 소속.",
  },
  {
    name_en: "Marketed Health Products Directorate",
    name_ko: "시판 건강제품국",
    acronym: "MHPD",
    website_url: "https://www.canada.ca/en/health-canada/corporate/about-health-canada/branches-agencies/health-products-food-branch/marketed-health-products-directorate.html",
    jurisdiction: "federal",
    description_en:
      "Responsible for post-market surveillance of NHPs and other health products. Monitors adverse reactions through Canada Vigilance Program, issues safety alerts and risk communications, and coordinates recalls when necessary.",
    description_ko:
      "NHP 및 기타 건강제품의 시판 후 안전성 감시를 담당합니다. Canada Vigilance 프로그램을 통해 부작용을 모니터링하고, 안전 경고 및 리스크 커뮤니케이션을 발행하며, 필요시 리콜을 조정합니다.",
  },
  {
    name_en: "Health Products and Food Branch Inspectorate",
    name_ko: "건강제품식품분과 감사국",
    acronym: "HPFBI",
    website_url: "https://www.canada.ca/en/health-canada/corporate/about-health-canada/branches-agencies/health-products-food-branch/inspectorate.html",
    jurisdiction: "federal",
    description_en:
      "Enforcement arm for NHP regulations. Conducts inspections of NHP manufacturing sites, issues compliance actions (Direction to Stop Sale, licence suspensions), investigates complaints, and manages product seizures at the border in cooperation with CBSA.",
    description_ko:
      "NHP 규정의 집행 기관. NHP 제조 시설 검사, 컴플라이언스 조치(판매 중지 명령, 라이선스 정지) 발행, 불만 조사, CBSA와 협력한 국경 제품 압류를 담당합니다.",
  },

  // ============================================
  // EXISTING AGENCIES (continued)
  // ============================================
  {
    name_en: "Standards Council of Canada",
    name_ko: "캐나다 표준위원회",
    acronym: "SCC",
    website_url: "https://www.scc.ca/",
    jurisdiction: "federal",
    description_en:
      "Publishes the Canadian Organic Standards (CAN/CGSB-32.310, CAN/CGSB-32.311) and the voluntary Non-GMO labelling standard (CAN/CGSB-32.315). Accredits conformity assessment bodies for organic certification.",
    description_ko:
      "캐나다 유기 표준(CAN/CGSB-32.310, CAN/CGSB-32.311) 및 자발적 Non-GMO 표시 표준(CAN/CGSB-32.315)을 발행합니다. 유기 인증을 위한 적합성 평가 기관을 인증합니다.",
  },
] as const;
