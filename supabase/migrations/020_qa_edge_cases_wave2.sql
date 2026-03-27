-- Wave 2: 40 new edge cases across 8 new/expanded categories
-- Based on real food industry scenarios and regulatory pain points

-- ============================================
-- NEW CATEGORY: nutrition_labeling (영양성분 표시 세부)
-- ============================================

INSERT INTO qa_regression_cases (name, category, language, question, expected_keywords_v2, min_confidence, priority) VALUES
('칼로리 표시 반올림 규칙', 'nutrition_labeling', 'ko',
 '캐나다 영양성분표에서 칼로리(Energy)를 어떻게 반올림해서 표시해야 하나요? 5칼로리 미만인 경우는?',
 '[{"en": "rounding", "ko": "반올림", "alternatives": ["올림", "rounding"]}, {"en": "5 Calories", "ko": "5칼로리", "alternatives": ["5 Cal", "5 kcal"]}, {"en": "Nutrition Facts", "ko": "영양성분표", "alternatives": ["Nutrition Facts"]}]'::jsonb,
 'LOW', 2),

('당류 %DV 표시', 'nutrition_labeling', 'ko',
 '캐나다 영양성분표에서 당류(Sugars)의 %DV(일일 권장량 대비 퍼센트)를 표시해야 하나요? 2022년 이후 변경사항은?',
 '[{"en": "sugars", "ko": "당류", "alternatives": ["설탕", "sugar"]}, {"en": "%DV", "ko": "%DV", "alternatives": ["일일 권장량", "Daily Value", "% Daily Value"]}, {"en": "mandatory", "ko": "의무", "alternatives": ["필수", "mandatory"]}]'::jsonb,
 'LOW', 2),

('비타민/미네랄 표시 기준', 'nutrition_labeling', 'ko',
 '캐나다 영양성분표에서 비타민과 미네랄은 어떤 것들을 의무적으로 표시해야 하나요? 비타민 A와 C는 더 이상 의무가 아닌가요?',
 '[{"en": "vitamin", "ko": "비타민", "alternatives": ["vitamin"]}, {"en": "potassium", "ko": "칼륨", "alternatives": ["potassium"]}, {"en": "iron", "ko": "철분", "alternatives": ["iron"]}, {"en": "calcium", "ko": "칼슘", "alternatives": ["calcium"]}]'::jsonb,
 'LOW', 2),

('서빙 사이즈 기준량', 'nutrition_labeling', 'en',
 'How are reference amounts and serving sizes determined for Canadian Nutrition Facts tables? What is the difference between reference amount and serving size?',
 '[{"en": "reference amount", "alternatives": ["reference amount", "RACC"]}, {"en": "serving size", "alternatives": ["serving size", "portion"]}, {"en": "Schedule M", "alternatives": ["Schedule M", "table"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: packaging (포장재/용기 규정)
-- ============================================

('식품 접촉면 안전성', 'packaging', 'ko',
 '캐나다에서 식품 포장재(식품 접촉 물질)에 대한 안전성 규정은 어떻게 되나요? 플라스틱 용기에 BPA가 허용되나요?',
 '[{"en": "food contact", "ko": "식품 접촉", "alternatives": ["food contact", "포장재"]}, {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]}, {"en": "BPA", "ko": "BPA", "alternatives": ["비스페놀A", "bisphenol"]}]'::jsonb,
 'LOW', 2),

('재활용 표시 의무', 'packaging', 'ko',
 '캐나다에서 식품 포장에 재활용 표시(recyclable, compostable 등)를 할 때 어떤 규정을 따라야 하나요? 그린워싱 방지 규정은?',
 '[{"en": "recyclable", "ko": "재활용", "alternatives": ["recyclable", "recycling"]}, {"en": "compostable", "ko": "퇴비화", "alternatives": ["compostable", "생분해"]}, {"en": "misleading", "ko": "오해", "alternatives": ["오도", "misleading", "greenwashing"]}]'::jsonb,
 'LOW', 2),

('진공포장 상온 유통', 'packaging', 'ko',
 '진공포장(vacuum-packed) 식품을 상온에서 유통하려면 캐나다에서 어떤 요건을 충족해야 하나요? 보툴리누스 위험 관리는?',
 '[{"en": "vacuum", "ko": "진공", "alternatives": ["vacuum", "진공포장"]}, {"en": "botulism", "ko": "보툴리누스", "alternatives": ["botulism", "Clostridium"]}, {"en": "thermal process", "ko": "열처리", "alternatives": ["살균", "thermal", "pasteurization"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: trade_agreement (무역 협정/원산지)
-- ============================================

('CPTPP 원산지 규정', 'trade_agreement', 'ko',
 'CPTPP(포괄적 점진적 환태평양 경제동반자 협정) 하에서 식품의 원산지 규정은 어떻게 적용되나요? 한국에서 캐나다로 수출 시 관세 혜택이 있나요?',
 '[{"en": "CPTPP", "ko": "CPTPP", "alternatives": ["환태평양", "TPP"]}, {"en": "rules of origin", "ko": "원산지 규정", "alternatives": ["원산지", "rules of origin"]}, {"en": "tariff", "ko": "관세", "alternatives": ["tariff", "duty"]}]'::jsonb,
 'LOW', 2),

('CKFTA 한-캐 FTA 활용', 'trade_agreement', 'ko',
 '한-캐 FTA(CKFTA)를 통해 식품 수출 시 관세 혜택을 받으려면 어떤 서류가 필요한가요? 원산지 증명서 발급 방법은?',
 '[{"en": "CKFTA", "ko": "한캐 FTA", "alternatives": ["CKFTA", "한-캐 FTA", "Korea FTA"]}, {"en": "certificate of origin", "ko": "원산지 증명서", "alternatives": ["원산지 증명", "certificate of origin"]}, {"en": "preferential", "ko": "특혜", "alternatives": ["preferential", "혜택"]}]'::jsonb,
 'LOW', 2),

('수입 식품 관세 분류', 'trade_agreement', 'en',
 'How do I determine the correct HS code (tariff classification) for a food product being imported into Canada? What happens if I classify it incorrectly?',
 '[{"en": "HS code", "alternatives": ["HS code", "tariff classification", "harmonized system"]}, {"en": "CBSA", "alternatives": ["CBSA", "Canada Border Services"]}, {"en": "penalty", "alternatives": ["penalty", "fine", "consequence"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: food_safety (식품 안전/HACCP)
-- ============================================

('PCP 예방적 통제 계획 세부', 'food_safety', 'ko',
 '캐나다에서 식품 제조업체가 작성해야 하는 PCP(Preventive Control Plan)에 반드시 포함해야 하는 요소는 무엇인가요?',
 '[{"en": "PCP", "ko": "PCP", "alternatives": ["예방적 통제 계획", "Preventive Control Plan"]}, {"en": "hazard analysis", "ko": "위해 분석", "alternatives": ["위험 분석", "hazard analysis", "HACCP"]}, {"en": "critical control", "ko": "중요 관리점", "alternatives": ["CCP", "critical control"]}]'::jsonb,
 'LOW', 2),

('식품 온도 관리 기준', 'food_safety', 'ko',
 '캐나다에서 냉장/냉동 식품의 운송 및 보관 온도 기준은 무엇인가요? 위험 온도 구간(danger zone)은?',
 '[{"en": "temperature", "ko": "온도", "alternatives": ["temperature"]}, {"en": "refrigeration", "ko": "냉장", "alternatives": ["냉동", "refrigeration", "cold chain"]}, {"en": "danger zone", "ko": "위험 온도", "alternatives": ["위험 구간", "danger zone", "4°C"]}]'::jsonb,
 'LOW', 2),

('리콜 등급 분류', 'food_safety', 'en',
 'What are the different classes of food recalls in Canada (Class I, II, III)? Who decides the recall class and what triggers a mandatory recall?',
 '[{"en": "Class I", "alternatives": ["Class I", "Class 1"]}, {"en": "health risk", "alternatives": ["health risk", "health hazard"]}, {"en": "CFIA", "alternatives": ["CFIA", "Canadian Food Inspection Agency"]}]'::jsonb,
 'LOW', 2),

('수입 식품 CFIA 검사', 'food_safety', 'ko',
 'CFIA가 수입 식품에 대해 국경에서 어떤 검사를 수행하나요? 검사 거부(refusal) 또는 억류(detention) 시 수입업자의 선택지는?',
 '[{"en": "inspection", "ko": "검사", "alternatives": ["검역", "inspection"]}, {"en": "detention", "ko": "억류", "alternatives": ["보류", "detention"]}, {"en": "refusal", "ko": "거부", "alternatives": ["거절", "refusal", "rejection"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: specific_industry (특정 산업별)
-- ============================================

('음료 라벨링', 'specific_industry', 'ko',
 '캐나다에서 과일 주스 음료의 라벨에 "주스(juice)"라는 용어를 사용하려면 과즙 함량이 몇 % 이상이어야 하나요? "드링크(drink)"와의 차이는?',
 '[{"en": "juice", "ko": "주스", "alternatives": ["juice"]}, {"en": "drink", "ko": "드링크", "alternatives": ["음료", "drink", "beverage"]}, {"en": "percentage", "ko": "퍼센트", "alternatives": ["%", "함량", "percentage"]}]'::jsonb,
 'LOW', 2),

('유제품 대체품 규정', 'specific_industry', 'ko',
 '캐나다에서 식물성 우유(오트밀크, 아몬드밀크 등)를 "우유(milk)"로 표기할 수 있나요? "유제품 대안(dairy alternative)"이라는 표현은?',
 '[{"en": "milk", "ko": "우유", "alternatives": ["milk", "밀크"]}, {"en": "plant-based", "ko": "식물성", "alternatives": ["plant-based", "식물 기반"]}, {"en": "common name", "ko": "일반명", "alternatives": ["통용명", "common name"]}]'::jsonb,
 'LOW', 2),

('제과/제빵 알레르기', 'specific_industry', 'ko',
 '제과점(bakery)에서 현장에서 만들어 판매하는 빵과 케이크에도 알레르기 표시를 해야 하나요? 포장하지 않는 식품의 알레르기 고지 의무는?',
 '[{"en": "bakery", "ko": "제과점", "alternatives": ["베이커리", "bakery", "빵집"]}, {"en": "unpackaged", "ko": "비포장", "alternatives": ["포장하지 않은", "unpackaged", "loose"]}, {"en": "allergen", "ko": "알레르기", "alternatives": ["알레르겐", "allergen"]}]'::jsonb,
 'LOW', 2),

('수산물 수입 특수 요건', 'specific_industry', 'en',
 'What special requirements apply to importing shellfish (shrimp, crab, lobster) into Canada? Are there specific countries approved for shellfish imports?',
 '[{"en": "shellfish", "alternatives": ["shellfish", "shrimp", "crustacean"]}, {"en": "approved", "alternatives": ["approved", "eligible", "authorized"]}, {"en": "CFIA", "alternatives": ["CFIA", "Canadian Food Inspection Agency"]}]'::jsonb,
 'LOW', 2),

('펫푸드 vs 인간 식품', 'specific_industry', 'ko',
 '캐나다에서 반려동물 사료(pet food)를 제조할 때 인간 식품과 같은 시설에서 만들 수 있나요? 사료와 식품의 규제 차이는?',
 '[{"en": "pet food", "ko": "반려동물 사료", "alternatives": ["펫푸드", "pet food", "사료"]}, {"en": "facility", "ko": "시설", "alternatives": ["공장", "facility", "제조시설"]}, {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: marketing_claims (마케팅 표시/주장)
-- ============================================

('"무첨가" 표시 규정', 'marketing_claims', 'ko',
 '캐나다에서 식품에 "무첨가(no added)", "무(free)", "-프리(-free)" 같은 표현을 사용할 때의 규정은? "설탕 무첨가"와 "무설탕"의 차이는?',
 '[{"en": "free", "ko": "무", "alternatives": ["프리", "free", "-free"]}, {"en": "no added", "ko": "무첨가", "alternatives": ["첨가하지 않은", "no added"]}, {"en": "sugar-free", "ko": "무설탕", "alternatives": ["sugar-free", "sugar free"]}]'::jsonb,
 'LOW', 2),

('"천연/자연" 표시', 'marketing_claims', 'ko',
 '캐나다에서 식품에 "천연(natural)", "자연산(wild)" 같은 표현을 사용할 수 있는 기준은 무엇인가요?',
 '[{"en": "natural", "ko": "천연", "alternatives": ["자연", "natural"]}, {"en": "misleading", "ko": "오해", "alternatives": ["오도", "misleading"]}, {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]}]'::jsonb,
 'LOW', 2),

('"로컬/지역산" 표시', 'marketing_claims', 'en',
 'What are the rules for using "local" or "locally grown" on food labels in Canada? Is there a defined distance or region?',
 '[{"en": "local", "alternatives": ["local", "locally"]}, {"en": "province", "alternatives": ["province", "provincial", "region"]}, {"en": "misleading", "alternatives": ["misleading", "truthful"]}]'::jsonb,
 'LOW', 2),

('"글루텐프리" 표시 기준', 'marketing_claims', 'ko',
 '캐나다에서 "글루텐프리(gluten-free)" 표시를 하려면 글루텐 함량이 몇 ppm 미만이어야 하나요? 오트(oat)는 글루텐프리로 표시 가능한가요?',
 '[{"en": "gluten-free", "ko": "글루텐프리", "alternatives": ["글루텐 프리", "gluten free"]}, {"en": "20 ppm", "ko": "20 ppm", "alternatives": ["20ppm", "20 ppm"]}, {"en": "oat", "ko": "오트", "alternatives": ["귀리", "oat"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- NEW CATEGORY: real_world_scenario (현실적 사업 시나리오)
-- ============================================

('한국 라면 캐나다 수출', 'real_world_scenario', 'ko',
 '한국에서 만든 인스턴트 라면을 캐나다에 수출하려고 합니다. 라벨을 어떻게 수정해야 하나요? 한국어만 있는 라벨을 캐나다용으로 바꾸는 절차는?',
 '[{"en": "bilingual", "ko": "이중 언어", "alternatives": ["영어", "프랑스어", "bilingual"]}, {"en": "ingredient list", "ko": "원재료", "alternatives": ["성분표", "ingredient"]}, {"en": "Nutrition Facts", "ko": "영양성분표", "alternatives": ["Nutrition Facts"]}, {"en": "allergen", "ko": "알레르기", "alternatives": ["알레르겐", "allergen"]}]'::jsonb,
 'MEDIUM', 1),

('김치 수출 시 주의사항', 'real_world_scenario', 'ko',
 '한국 김치를 캐나다에 수출할 때 라벨에 표시해야 할 사항과 주의점은 무엇인가요? 발효식품 특유의 규제 이슈가 있나요?',
 '[{"en": "fermented", "ko": "발효", "alternatives": ["fermented"]}, {"en": "labeling", "ko": "라벨", "alternatives": ["표시", "labeling", "label"]}, {"en": "common name", "ko": "일반명", "alternatives": ["제품명", "common name"]}, {"en": "ingredient", "ko": "원재료", "alternatives": ["성분", "ingredient"]}]'::jsonb,
 'MEDIUM', 1),

('한국 고추장 수출', 'real_world_scenario', 'ko',
 '고추장을 캐나다에 수출하려면 어떤 라벨 요건을 충족해야 하나요? MSG가 포함된 경우 별도 표시가 필요한가요?',
 '[{"en": "MSG", "ko": "MSG", "alternatives": ["글루탐산나트륨", "monosodium glutamate"]}, {"en": "ingredient", "ko": "원재료", "alternatives": ["성분", "ingredient"]}, {"en": "allergen", "ko": "알레르기", "alternatives": ["알레르겐", "allergen"]}]'::jsonb,
 'MEDIUM', 1),

('소규모 온라인 판매 시작', 'real_world_scenario', 'ko',
 '캐나다에서 집에서 만든 쿠키와 잼을 Etsy나 온라인으로 판매하고 싶습니다. 어떤 허가와 라벨이 필요한가요? 연방 vs 주(provincial) 규정 차이는?',
 '[{"en": "home-based", "ko": "가정", "alternatives": ["집", "home", "cottage"]}, {"en": "provincial", "ko": "주", "alternatives": ["provincial", "지방"]}, {"en": "licence", "ko": "허가", "alternatives": ["면허", "라이선스", "licence", "license"]}]'::jsonb,
 'LOW', 1),

('식품 수입업 창업 절차', 'real_world_scenario', 'ko',
 '캐나다에서 식품 수입업을 시작하려고 합니다. 처음부터 끝까지 어떤 단계를 거쳐야 하나요? SFC 라이선스 신청부터 첫 수입까지의 전체 프로세스를 알려주세요.',
 '[{"en": "SFC licence", "ko": "SFC 라이선스", "alternatives": ["라이선스", "면허", "licence"]}, {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]}, {"en": "register", "ko": "등록", "alternatives": ["신청", "register", "registration"]}]'::jsonb,
 'MEDIUM', 1),

('미국 제품 캐나다 재판매', 'real_world_scenario', 'en',
 'I bought food products from Costco in the US and want to resell them in Canada. Can I do this? What labeling changes are needed?',
 '[{"en": "import", "alternatives": ["import", "importing"]}, {"en": "relabeling", "alternatives": ["relabel", "re-label", "relabeling"]}, {"en": "bilingual", "alternatives": ["bilingual", "French", "English"]}]'::jsonb,
 'LOW', 1),

-- ============================================
-- NEW CATEGORY: multilingual_edge (언어/표현 경계 테스트)
-- ============================================

('혼합 언어 질문', 'multilingual_edge', 'ko',
 'Food labeling 규정에서 allergen 표시를 할 때 한국어 라벨에도 영어로 allergen name을 병기해야 하나요?',
 '[{"en": "allergen", "ko": "알레르기", "alternatives": ["알레르겐", "allergen"]}, {"en": "labeling", "ko": "라벨링", "alternatives": ["표시", "label"]}]'::jsonb,
 'LOW', 3),

('축약어만 사용', 'multilingual_edge', 'en',
 'What is the difference between FDR, SFCR, and CPLA regarding food labeling?',
 '[{"en": "Food and Drug Regulations", "alternatives": ["FDR", "Food and Drug"]}, {"en": "Safe Food for Canadians", "alternatives": ["SFCR", "Safe Food"]}, {"en": "Consumer Packaging", "alternatives": ["CPLA", "Consumer Packaging"]}]'::jsonb,
 'LOW', 3),

('매우 전문적인 질문', 'multilingual_edge', 'ko',
 'FDR B.01.401 Table of Reference Standards에서 serving size reference amount가 변경된 품목이 있나요?',
 '[{"en": "B.01.401", "ko": "B.01.401"}, {"en": "reference", "ko": "기준", "alternatives": ["reference", "참조"]}]'::jsonb,
 'LOW', 3),

-- ============================================
-- EXPANDED: allergen (추가 알레르기 시나리오)
-- ============================================

('새로운 알레르겐 추가 가능성', 'allergen', 'ko',
 '캐나다의 우선 알레르기 유발물질 목록에 새로운 알레르겐이 추가될 수 있나요? 최근 추가되거나 논의 중인 알레르겐이 있나요?',
 '[{"en": "priority allergen", "ko": "우선 알레르기", "alternatives": ["주요 알레르겐", "priority allergen"]}, {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]}, {"en": "list", "ko": "목록", "alternatives": ["list"]}]'::jsonb,
 'LOW', 2),

('알레르겐 교차접촉 관리', 'allergen', 'en',
 'What are the requirements for managing allergen cross-contact in a food manufacturing facility in Canada? Is a dedicated allergen-free production line required?',
 '[{"en": "cross-contact", "alternatives": ["cross-contact", "cross contact", "cross-contamination"]}, {"en": "manufacturing", "alternatives": ["manufacturing", "production", "facility"]}, {"en": "PCP", "alternatives": ["PCP", "preventive control", "HACCP"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- EXPANDED: enforcement (법 집행/위반 사례)
-- ============================================

('라벨 위반 과태료', 'enforcement', 'ko',
 '캐나다에서 식품 라벨 규정을 위반하면 어떤 처벌을 받나요? 벌금 금액과 위반 등급은?',
 '[{"en": "penalty", "ko": "벌금", "alternatives": ["과태료", "penalty", "fine"]}, {"en": "violation", "ko": "위반", "alternatives": ["violation"]}, {"en": "SFCA", "ko": "SFCA", "alternatives": ["Safe Food for Canadians Act"]}]'::jsonb,
 'LOW', 2),

('허위 유기농 표시', 'enforcement', 'en',
 'What happens if a company falsely labels a product as "organic" in Canada without proper certification? What are the enforcement mechanisms?',
 '[{"en": "organic", "alternatives": ["organic"]}, {"en": "certification", "alternatives": ["certification", "certified"]}, {"en": "CFIA", "alternatives": ["CFIA", "Canadian Food Inspection Agency"]}, {"en": "penalty", "alternatives": ["penalty", "fine", "prosecution"]}]'::jsonb,
 'LOW', 2),

-- ============================================
-- EXPANDED: novel_food (신규/첨단 식품)
-- ============================================

('3D 프린팅 식품', 'novel_food', 'ko',
 '3D 프린터로 만든 식품을 캐나다에서 판매할 수 있나요? 어떤 규제 프레임워크가 적용되나요?',
 '[{"en": "novel food", "ko": "신규 식품", "alternatives": ["novel food", "신소재"]}, {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]}, {"en": "pre-market", "ko": "시판 전", "alternatives": ["사전 승인", "pre-market"]}]'::jsonb,
 'LOW', 3),

('마이코프로틴/균류 단백질', 'novel_food', 'en',
 'Is mycoprotein (like Quorn) considered a novel food in Canada? What approval process does a new fungal protein source need to go through?',
 '[{"en": "novel food", "alternatives": ["novel food", "novel"]}, {"en": "mycoprotein", "alternatives": ["mycoprotein", "fungal", "Quorn"]}, {"en": "Health Canada", "alternatives": ["Health Canada"]}]'::jsonb,
 'LOW', 3);
