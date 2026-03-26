-- ============================================
-- QA Regression: Comprehensive Edge Case Suite
-- ============================================
-- 50 edge cases across 12 categories, informed by:
-- - Real CFIA enforcement actions & recalls (2024-2025)
-- - Common food industry regulatory questions
-- - Emerging food categories (plant-based, insect protein, CBD, NHP)
-- - Cross-border import challenges (Korea→Canada, US→Canada)
-- - Provincial vs federal jurisdiction gaps
-- - E-commerce & DTC food sales
-- ============================================

-- ────────────────────────────────────────────
-- Category 1: NOVEL & EMERGING FOODS
-- Tests: web fallback, hallucination prevention, "unknown" handling
-- ────────────────────────────────────────────

INSERT INTO qa_regression_cases (name, category, language, question, expected_citations, expected_keywords, forbidden_keywords, min_confidence, priority, description) VALUES

-- 1.1 Plant-based meat (Korean)
('대체육 생산 규정 KO', 'novel_food', 'ko',
 '대체육(식물성 고기)을 캐나다에서 생산하려면 어떤 규정을 따라야 하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['simulated', 'B.01.100', 'labeling', 'CFIA'],
 ARRAY['FDA approval required', 'USDA'],
 'MEDIUM', 1,
 'Tests bilingual query expansion + simulated meat regulation retrieval'),

-- 1.2 Insect protein
('곤충 단백질 식품', 'novel_food', 'ko',
 '귀뚜라미 분말을 이용한 에너지바를 캐나다에서 판매하려면 어떤 허가가 필요한가요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['novel food', 'Health Canada'],
 ARRAY['banned', 'illegal', 'prohibited'],
 'LOW', 1,
 'Tests novel food notification process — DB likely has no insect-specific content'),

-- 1.3 CBD food products
('CBD 식품 판매 가능성', 'novel_food', 'ko',
 'CBD가 함유된 건강 음료를 캐나다에서 합법적으로 판매할 수 있나요?',
 '[{"regulation_name": "Cannabis Act"}]'::jsonb,
 ARRAY['Cannabis Act', 'cannabis', 'Health Canada', 'prohibited', 'edible'],
 ARRAY['freely available', 'no restrictions', 'legal to sell without'],
 'MEDIUM', 1,
 'Tests cross-regulation (Cannabis Act + Food & Drugs Act) — must NOT hallucinate permissiveness'),

-- 1.4 Lab-grown / cultured meat
('배양육 규제 현황', 'novel_food', 'ko',
 '세포배양 방식으로 만든 배양육(cultivated meat)을 캐나다에서 판매할 수 있나요? 어떤 승인 절차가 필요한가요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['novel food', 'Health Canada', 'pre-market'],
 ARRAY['already approved', 'freely sold'],
 'LOW', 2,
 'Tests handling of truly novel area with limited regulatory clarity'),

-- 1.5 Functional foods with health claims
('기능성 식품 건강 강조 표시', 'novel_food', 'ko',
 '프로바이오틱스 요거트에 "면역력 강화"라고 표시할 수 있나요? 캐나다에서 허용되는 건강 강조 표시(health claims)의 기준은?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['health claim', 'B.01.603', 'therapeutic'],
 ARRAY['freely claim', 'no restrictions on claims'],
 'MEDIUM', 1,
 'Tests strict health claims regulation — common violation area'),

-- ────────────────────────────────────────────
-- Category 2: IMPORT & CROSS-BORDER COMPLIANCE
-- Tests: multi-regulation retrieval, CBSA/CFIA overlap
-- ────────────────────────────────────────────

-- 2.1 Korean food import specifics
('한국 식품 수입 절차', 'import', 'ko',
 '한국에서 만든 김치를 캐나다에 수입해서 판매하려면 어떤 절차와 서류가 필요한가요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}, {"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['SFC licence', 'CFIA', 'labeling', 'bilingual', 'ingredient list'],
 ARRAY['USDA', 'FDA approval'],
 'MEDIUM', 1,
 'Tests Korea-specific import pathway — high relevance for target users'),

-- 2.2 Meat import restrictions
('육류 수입 국가 제한', 'import', 'ko',
 '브라질산 소고기를 캐나다에 수입할 수 있나요? 육류 수입이 허용되는 국가 목록은 어디서 확인하나요?',
 '[{"regulation_name": "Meat Inspection Act"}, {"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['approved country', 'CFIA', 'meat', 'inspection'],
 ARRAY['anyone can import', 'no restrictions'],
 'LOW', 2,
 'Tests meat-specific import rules — separate from general food import'),

-- 2.3 Re-labeling imported products
('수입 식품 재라벨링', 'import', 'ko',
 '미국에서 수입한 식품의 라벨을 캐나다 규격에 맞게 재라벨링(re-labeling)하려면 어떤 요건을 충족해야 하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Consumer Packaging and Labelling Act"}]'::jsonb,
 ARRAY['bilingual', 'French', 'English', 'net quantity', 'metric'],
 ARRAY['original label is sufficient'],
 'MEDIUM', 1,
 'Tests bilingual + metric conversion requirements for re-labeling'),

-- 2.4 Temporary import for trade shows
('무역 박람회용 임시 수입', 'import', 'ko',
 '캐나다 식품 박람회에 한국 식품 샘플을 가져가려면 수입 라이선스가 필요한가요? 비매품 샘플도 같은 규정이 적용되나요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['sample', 'personal use', 'CFIA'],
 ARRAY[]::text[],
 'LOW', 2,
 'Tests exemption/exception knowledge — many importers ask this'),

-- 2.5 Cross-border e-commerce
('국제 온라인 식품 판매', 'import', 'en',
 'I run a Shopify store in the US. Can I ship food products directly to Canadian customers without an SFC licence?',
 '[{"regulation_name": "Safe Food for Canadians Act"}, {"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['SFC licence', 'import', 'CFIA', 'e-commerce'],
 ARRAY['no licence needed', 'freely ship'],
 'MEDIUM', 1,
 'Tests e-commerce import rules — common misconception that online sales are exempt'),

-- ────────────────────────────────────────────
-- Category 3: LABELING EDGE CASES
-- Tests: precision of section retrieval, NFT rules
-- ────────────────────────────────────────────

-- 3.1 "Best before" vs "Expiration date"
('유통기한 vs 소비기한', 'labeling', 'ko',
 '"best before" 날짜와 "expiration date"의 차이는 무엇인가요? 어떤 식품에 어떤 날짜를 표시해야 하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['best before', 'expiration', 'B.01.007', 'durable life'],
 ARRAY['interchangeable', 'same thing'],
 'MEDIUM', 1,
 'Tests precise distinction between two commonly confused date marking types'),

-- 3.2 Small package exemptions
('소형 패키지 라벨 면제', 'labeling', 'ko',
 '식품 포장이 아주 작을 경우(캔디, 초콜릿 등) 영양성분표나 성분 목록을 생략할 수 있나요? 소형 패키지 면제 기준은?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['small package', 'exemption', 'display surface'],
 ARRAY['all packages must have NFT', 'no exemptions'],
 'MEDIUM', 2,
 'Tests knowledge of NFT/ingredient list exemptions for small packages'),

-- 3.3 Bilingual labeling specifics
('이중 언어 라벨 세부 요건', 'labeling', 'ko',
 '캐나다에서 식품 라벨은 반드시 영어와 프랑스어로 표기해야 하나요? 한국어도 추가할 수 있나요? 어떤 정보가 반드시 이중 언어여야 하나요?',
 '[{"regulation_name": "Consumer Packaging and Labelling Act"}, {"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['English', 'French', 'bilingual', 'common name', 'ingredient'],
 ARRAY['Korean is required', 'any language is fine'],
 'MEDIUM', 1,
 'Tests bilingual requirements — critical for Korean importers'),

-- 3.4 Front-of-package (FOP) nutrition labeling
('전면 영양 표시 FOP', 'labeling', 'ko',
 '2026년부터 시행되는 캐나다 전면 영양 표시(Front-of-Package labeling) 규정은 어떤 내용인가요? 어떤 제품이 해당되나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['front-of-package', 'FOP', 'saturated fat', 'sodium', 'sugar'],
 ARRAY['already in effect', 'voluntary'],
 'LOW', 1,
 'Tests awareness of upcoming regulation changes (Jan 2026 FOP deadline)'),

-- 3.5 "Made in Canada" claims
('메이드 인 캐나다 표시', 'labeling', 'ko',
 '"Made in Canada"와 "Product of Canada"의 차이는 무엇인가요? 수입 원재료를 사용해서 캐나다에서 가공한 제품에 어떤 표시를 할 수 있나요?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Consumer Packaging and Labelling Act"}]'::jsonb,
 ARRAY['Product of Canada', 'Made in Canada', 'substantial transformation', '98%'],
 ARRAY['same meaning', 'interchangeable'],
 'MEDIUM', 1,
 'Tests origin claim distinction — common confusion for food producers'),

-- 3.6 Nutrition Facts Table format
('NFT 특수 형식', 'labeling', 'en',
 'What are the acceptable formats for the Nutrition Facts Table when the label is too small for the standard format? Can I use a linear/horizontal format?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['Nutrition Facts', 'linear', 'horizontal', 'B.01.401'],
 ARRAY['only one format allowed'],
 'MEDIUM', 2,
 'Tests NFT format alternatives — multiple valid formats exist'),

-- ────────────────────────────────────────────
-- Category 4: ALLERGEN & SAFETY
-- Tests: critical safety info accuracy, recall awareness
-- ────────────────────────────────────────────

-- 4.1 Priority allergen list
('우선 알레르기 유발물질 목록', 'allergen', 'ko',
 '캐나다에서 식품 라벨에 반드시 표시해야 하는 우선 알레르기 유발물질(priority allergens)의 전체 목록은 무엇인가요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['peanut', 'tree nut', 'milk', 'egg', 'wheat', 'soy', 'sesame', 'mustard', 'sulphites', 'B.01.010.1'],
 ARRAY['only 8 allergens', 'same as US'],
 'HIGH', 1,
 'Tests completeness of allergen list — Canada has unique items (mustard, sesame)'),

-- 4.2 Precautionary allergen labeling (PAL)
('교차 오염 알레르기 표시', 'allergen', 'ko',
 '"이 제품은 땅콩을 처리하는 시설에서 생산되었습니다" 같은 사전 예방 알레르기 표시(precautionary allergen labeling)는 의무인가요 자발적인가요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['precautionary', 'voluntary', 'may contain', 'cross-contamination'],
 ARRAY['mandatory', 'required by law', 'must include'],
 'MEDIUM', 1,
 'Tests PAL voluntary vs mandatory distinction — commonly misunderstood'),

-- 4.3 Gluten-free claims
('글루텐 프리 표시 기준', 'allergen', 'ko',
 '"글루텐 프리(gluten-free)" 표시를 하려면 어떤 기준을 충족해야 하나요? 20ppm 이하면 되나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['gluten-free', '20 ppm', 'B.24'],
 ARRAY['no standard exists', 'any amount is fine'],
 'MEDIUM', 2,
 'Tests gluten-free threshold knowledge — specific ppm standard'),

-- 4.4 Allergen in spice blends
('양념 내 숨겨진 알레르기 유발물질', 'allergen', 'ko',
 '수입 양념 블렌드에 "spices"라고만 표시되어 있는데, 겨자(mustard)가 포함되어 있을 수 있습니다. 캐나다에서 이렇게 표시해도 되나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['mustard', 'priority allergen', 'declare', 'B.01.010.1'],
 ARRAY['spices is sufficient', 'no need to declare'],
 'MEDIUM', 1,
 'Tests hidden allergen in collective terms — real CFIA enforcement focus'),

-- 4.5 Allergen source declaration format
('알레르기 유발물질 강조 표시', 'allergen', 'en',
 'Does Canada require allergens to be highlighted in bold in the ingredient list, like the EU does? What is the "Contains" statement requirement?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['Contains', 'B.01.010.1', 'source', 'declaration'],
 ARRAY['must be bold', 'same as EU rules'],
 'MEDIUM', 2,
 'Tests Canada-specific allergen formatting vs EU — different requirements'),

-- ────────────────────────────────────────────
-- Category 5: FOOD ADDITIVES & INGREDIENTS
-- Tests: permitted lists, specific substance queries
-- ────────────────────────────────────────────

-- 5.1 Specific additive query
('특정 첨가물 허가 여부', 'additive', 'ko',
 '식품에 이산화티타늄(titanium dioxide, E171)을 착색료로 사용해도 되나요? 캐나다에서 허가된 식용 색소 목록은 어디서 확인하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['permitted', 'colour', 'Health Canada', 'List of Permitted'],
 ARRAY['banned worldwide', 'always safe'],
 'LOW', 2,
 'Tests specific additive lookup — titanium dioxide is controversial (banned in EU)'),

-- 5.2 Natural preservatives
('천연 방부제 규정', 'additive', 'ko',
 '로즈마리 추출물을 천연 방부제로 식품에 사용하려면 첨가물 허가가 필요한가요? "천연"이라고 표시할 수 있나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['preservative', 'natural', 'List of Permitted'],
 ARRAY['no regulation needed', 'freely use'],
 'LOW', 2,
 'Tests natural additive classification — gray area between ingredient and additive'),

-- 5.3 Fortification requirements
('영양소 강화 규정', 'additive', 'ko',
 '식물성 우유(오트밀크, 아몬드밀크)에 비타민 D와 칼슘을 의무적으로 첨가해야 하나요? 강화(fortification) 규정은?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['fortification', 'vitamin D', 'calcium', 'plant-based'],
 ARRAY['no fortification rules', 'voluntary only'],
 'MEDIUM', 1,
 'Tests mandatory fortification for dairy alternatives — real industry issue'),

-- 5.4 Sweetener restrictions
('감미료 사용 제한', 'additive', 'en',
 'Can I use stevia and monk fruit extract together in a soft drink? Are there any limits on combining non-nutritive sweeteners in Canada?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['sweetener', 'stevia', 'permitted', 'Table'],
 ARRAY['no limits', 'use any amount'],
 'LOW', 2,
 'Tests sweetener regulation specifics — combination rules are nuanced'),

-- ────────────────────────────────────────────
-- Category 6: SMALL PRODUCER & COTTAGE FOOD
-- Tests: provincial vs federal distinction, exemption handling
-- ────────────────────────────────────────────

-- 6.1 Cottage food / home kitchen
('가정 주방 식품 판매', 'small_producer', 'ko',
 '집에서 만든 쿠키나 잼을 파머스 마켓에서 판매하려면 어떤 허가가 필요한가요? 가정 주방에서 만든 식품도 SFC 라이선스가 필요한가요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['exemption', 'interprovincial', 'provincial'],
 ARRAY['no rules apply', 'completely unregulated'],
 'LOW', 1,
 'Tests provincial vs federal jurisdiction for small producers — no uniform cottage food law'),

-- 6.2 Farmers market regulations
('파머스 마켓 규정', 'small_producer', 'ko',
 '파머스 마켓에서 직접 만든 소스류를 판매할 때 영양성분표(NFT)를 반드시 부착해야 하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['Nutrition Facts', 'exemption'],
 ARRAY['always required', 'never exempt'],
 'LOW', 2,
 'Tests NFT exemptions for direct-to-consumer/small batch sales'),

-- 6.3 Food truck licensing
('푸드트럭 인허가', 'small_producer', 'ko',
 '푸드트럭을 운영하려면 어떤 연방 및 지방 허가가 필요한가요? SFC 라이선스와 지방 보건 허가 둘 다 필요한가요?',
 '[]'::jsonb,
 ARRAY['provincial', 'municipal', 'health', 'licence'],
 ARRAY['federal licence only', 'no permits needed'],
 'LOW', 2,
 'Tests multi-jurisdictional knowledge — food trucks primarily provincial/municipal'),

-- ────────────────────────────────────────────
-- Category 7: ORGANIC & SPECIALTY CLAIMS
-- Tests: claim-specific regulation retrieval
-- ────────────────────────────────────────────

-- 7.1 Organic certification
('유기농 인증', 'claims', 'ko',
 '캐나다에서 "유기농(organic)"이라고 표시하려면 어떤 인증이 필요한가요? 한국 유기농 인증이 캐나다에서도 인정되나요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['organic', 'certification', 'Canada Organic'],
 ARRAY['self-declared is enough', 'no certification needed'],
 'MEDIUM', 1,
 'Tests organic certification pathway + equivalence agreements'),

-- 7.2 "Natural" claim
('내추럴 표시 기준', 'claims', 'ko',
 '식품에 "natural" 또는 "천연"이라고 표시하려면 어떤 기준을 충족해야 하나요? 법적 정의가 있나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['natural', 'CFIA', 'guideline'],
 ARRAY['no rules exist', 'anyone can claim'],
 'LOW', 2,
 'Tests "natural" claim — legally ambiguous area, often over-claimed'),

-- 7.3 Non-GMO claims
('비유전자변형 표시', 'claims', 'ko',
 '"Non-GMO" 또는 "GMO free"라고 식품에 표시할 수 있나요? 캐나다에서 비유전자변형 표시의 법적 기준은?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['GMO', 'voluntary', 'misleading'],
 ARRAY['mandatory GMO labeling', 'must disclose all GMO'],
 'LOW', 2,
 'Tests voluntary nature of GMO labeling in Canada — different from some countries'),

-- 7.4 Halal / Kosher certification
('할랄 코셔 인증 표시', 'claims', 'ko',
 '캐나다에서 식품에 할랄(Halal) 또는 코셔(Kosher) 표시를 하려면 어떤 요건이 필요한가요? 정부 인증인가요 민간 인증인가요?',
 '[]'::jsonb,
 ARRAY['Halal', 'Kosher', 'certification'],
 ARRAY['government certification required', 'CFIA certifies Halal'],
 'LOW', 2,
 'Tests religious certification — third-party vs government role'),

-- ────────────────────────────────────────────
-- Category 8: SPECIFIC FOOD CATEGORIES
-- Tests: category-specific regulation retrieval
-- ────────────────────────────────────────────

-- 8.1 Infant food / baby food
('영유아 식품 규정', 'specific_food', 'ko',
 '영유아용 식품(baby food, infant formula)을 캐나다에서 판매하려면 일반 식품과 다른 추가 규정이 있나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['infant', 'B.25', 'formulated', 'Health Canada'],
 ARRAY['same as regular food', 'no special rules'],
 'MEDIUM', 1,
 'Tests infant food special regulations — much stricter than general food'),

-- 8.2 Alcohol-containing food
('알코올 함유 식품', 'specific_food', 'ko',
 '티라미수나 럼케이크처럼 알코올이 소량 함유된 식품의 규정은? 알코올 함량 표시가 필요한 기준은?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['alcohol', 'percentage'],
 ARRAY['no alcohol rules for food'],
 'LOW', 2,
 'Tests alcohol-in-food threshold — often overlooked by food producers'),

-- 8.3 Seafood species identification
('수산물 종 명칭', 'specific_food', 'en',
 'What are the rules for naming fish species on labels in Canada? Can I label farmed salmon simply as "salmon"?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['common name', 'fish', 'species'],
 ARRAY['any name is acceptable'],
 'LOW', 2,
 'Tests fish naming rules — species fraud is a major enforcement area'),

-- 8.4 Fermented foods (kimchi, kombucha)
('발효 식품 규정', 'specific_food', 'ko',
 '김치나 콤부차 같은 발효 식품을 캐나다에서 상업적으로 판매할 때 특별한 규정이 있나요? 라벨에 "probiotics"라고 표시할 수 있나요?',
 '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['fermented', 'probiotic', 'health claim'],
 ARRAY['no special rules for fermented foods'],
 'LOW', 1,
 'Tests fermented food rules — probiotic claims cross into health claims territory'),

-- 8.5 Honey grading and labeling
('꿀 등급 표시', 'specific_food', 'ko',
 '캐나다에서 꿀을 판매할 때 등급(grade) 표시가 의무인가요? 수입 꿀과 국내산 꿀의 라벨 요건 차이는?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['honey', 'grade', 'Canada No. 1'],
 ARRAY['no grading required'],
 'LOW', 2,
 'Tests commodity-specific grading rules — honey has specific standards'),

-- ────────────────────────────────────────────
-- Category 9: E-COMMERCE & DTC
-- Tests: digital sales regulation coverage
-- ────────────────────────────────────────────

-- 9.1 Online food label display
('온라인 식품 라벨 표시', 'ecommerce', 'ko',
 '온라인 쇼핑몰(Amazon.ca, Shopify)에서 식품을 판매할 때 제품 페이지에 영양성분표와 성분 목록을 표시해야 하나요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['e-commerce', 'label', 'online'],
 ARRAY['no rules for online', 'only physical label matters'],
 'LOW', 1,
 'Tests CFIA e-commerce guidance — relatively new regulatory area'),

-- 9.2 Subscription box model
('식품 구독 서비스 규정', 'ecommerce', 'ko',
 '매월 다른 식품을 배송하는 구독 박스(subscription box) 서비스를 운영하려면 어떤 식품 규정을 준수해야 하나요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['SFC licence', 'CFIA', 'labeling', 'traceability'],
 ARRAY['subscription boxes are exempt'],
 'LOW', 2,
 'Tests compiled compliance for novel business models'),

-- 9.3 Meal kit regulations
('밀키트 규정', 'ecommerce', 'en',
 'What food safety regulations apply to meal kit delivery services in Canada? Do individual ingredients in a meal kit each need their own label?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}, {"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['meal kit', 'labeling', 'prepackaged', 'CFIA'],
 ARRAY['meal kits are exempt from labeling'],
 'LOW', 2,
 'Tests meal kit as food product classification — multi-component labeling'),

-- ────────────────────────────────────────────
-- Category 10: RECALLS & ENFORCEMENT
-- Tests: practical enforcement knowledge
-- ────────────────────────────────────────────

-- 10.1 Recall procedure
('식품 리콜 절차', 'enforcement', 'ko',
 '내 제품에서 알레르기 유발물질 미표시가 발견되었습니다. 자발적 리콜을 해야 하나요? 캐나다 식품 리콜 절차는 어떻게 되나요?',
 '[{"regulation_name": "Safe Food for Canadians Act"}]'::jsonb,
 ARRAY['recall', 'CFIA', 'mandatory', 'traceability'],
 ARRAY['no recall needed', 'optional'],
 'MEDIUM', 1,
 'Tests recall procedures — triggered by real CFIA enforcement patterns (94 recalls in 2024-25)'),

-- 10.2 Traceability requirements
('이력 추적 요건', 'enforcement', 'ko',
 '캐나다에서 식품 이력 추적(traceability) 요건은 무엇인가요? "one step forward, one step back" 원칙이 뭔가요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
 ARRAY['traceability', 'one step', 'record', 'SFCR'],
 ARRAY['no traceability needed', 'voluntary'],
 'MEDIUM', 2,
 'Tests traceability requirements — mandatory under SFCR'),

-- 10.3 CFIA inspection rights
('CFIA 검사 권한', 'enforcement', 'en',
 'What powers does a CFIA inspector have when inspecting a food processing facility? Can they seize products without a warrant?',
 '[{"regulation_name": "Safe Food for Canadians Act"}]'::jsonb,
 ARRAY['inspector', 'inspection', 'seize', 'SFCA'],
 ARRAY['cannot seize', 'warrant always required'],
 'LOW', 2,
 'Tests enforcement powers knowledge — inspectors have broad authority under SFCA'),

-- ────────────────────────────────────────────
-- Category 11: NHP & SUPPLEMENTS
-- Tests: food vs NHP boundary, cross-regulation
-- ────────────────────────────────────────────

-- 11.1 Food vs NHP boundary
('식품 vs 천연건강제품 구분', 'nhp', 'ko',
 '비타민이 첨가된 음료를 만들려고 합니다. 이것이 식품인가요 천연건강제품(NHP)인가요? 분류 기준은 무엇인가요?',
 '[{"regulation_name": "Natural Health Products Regulations"}, {"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['NHP', 'Natural Health Product', 'Health Canada', 'therapeutic'],
 ARRAY['always a food', 'always an NHP'],
 'LOW', 1,
 'Tests food/NHP classification boundary — critical regulatory fork'),

-- 11.2 Supplement facts vs nutrition facts
('보충제 표시 vs 영양성분표', 'nhp', 'ko',
 '프로틴 파우더 제품의 라벨에 Nutrition Facts Table을 써야 하나요 아니면 Supplement Facts를 써야 하나요?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Natural Health Products Regulations"}]'::jsonb,
 ARRAY['Nutrition Facts', 'Supplement Facts', 'NHP', 'classification'],
 ARRAY['either one is fine', 'no label required'],
 'LOW', 2,
 'Tests protein powder classification — depends on food vs NHP determination'),

-- 11.3 Herbal tea health claims
('허브차 건강 표시', 'nhp', 'ko',
 '허브차에 "소화에 도움" 또는 "스트레스 완화"라고 표시할 수 있나요? 이런 표시를 하면 NHP로 분류되나요?',
 '[{"regulation_name": "Food and Drug Regulations"}, {"regulation_name": "Natural Health Products Regulations"}]'::jsonb,
 ARRAY['health claim', 'therapeutic', 'NHP', 'DIN'],
 ARRAY['freely claim health benefits'],
 'MEDIUM', 1,
 'Tests health claim triggering NHP classification — critical compliance line'),

-- ────────────────────────────────────────────
-- Category 12: AMBIGUOUS / OUT-OF-SCOPE / ADVERSARIAL
-- Tests: hallucination prevention, graceful handling
-- ────────────────────────────────────────────

-- 12.1 Completely off-topic
('완전히 무관한 질문', 'boundary', 'ko',
 '캐나다에서 자동차를 수입하려면 어떤 절차가 필요한가요?',
 '[]'::jsonb,
 ARRAY['식품', '범위'],
 ARRAY['import licence', 'SFC licence', 'CFIA'],
 'LOW', 1,
 'Tests off-topic rejection — must NOT apply food regulations to non-food'),

-- 12.2 US regulation confusion
('미국 규정 혼동', 'boundary', 'ko',
 'FDA 21 CFR Part 101에 따른 영양 표시 규정이 캐나다에서도 적용되나요?',
 '[]'::jsonb,
 ARRAY['캐나다', 'Canada', 'different'],
 ARRAY['yes it applies', 'FDA rules apply in Canada', '21 CFR'],
 'MEDIUM', 1,
 'Tests Canada-US regulation distinction — must NOT confirm US rules for Canada'),

-- 12.3 Extremely vague question
('극도로 모호한 질문', 'boundary', 'ko',
 '라벨 어떻게 해요?',
 '[]'::jsonb,
 ARRAY['라벨', 'label'],
 ARRAY[]::text[],
 'LOW', 2,
 'Tests handling of vague questions — should provide overview or ask for clarification'),

-- 12.4 Multiple questions in one
('복합 질문', 'boundary', 'ko',
 '한국에서 만든 고추장을 캐나다에 수입해서 온라인으로 판매하려는데, 라벨은 어떻게 해야 하고, 첨가물 규정은 뭐고, 유통기한은 어떻게 표시하고, 가격은 어떻게 책정해야 하나요?',
 '[{"regulation_name": "Safe Food for Canadians Regulations"}, {"regulation_name": "Food and Drug Regulations"}]'::jsonb,
 ARRAY['labeling', 'additive', 'best before', 'import'],
 ARRAY['pricing regulations'],
 'LOW', 1,
 'Tests multi-part question handling — should address regulatory parts, note pricing is out of scope'),

-- 12.5 Asking for legal advice
('법률 자문 요청', 'boundary', 'ko',
 '제 제품이 CFIA에 의해 압수당했습니다. 소송을 제기해야 하나요? 어떤 변호사를 고용해야 하나요?',
 '[]'::jsonb,
 ARRAY['법률 자문', 'legal advice', 'CFIA'],
 ARRAY['you should sue', 'hire this lawyer', 'I recommend'],
 'LOW', 1,
 'Tests legal advice boundary — must NOT provide specific litigation advice'),

-- 12.6 Hypothetical future regulation
('가상의 미래 규정', 'boundary', 'en',
 'Will Canada ban artificial food colorings in 2027 like the EU is considering?',
 '[]'::jsonb,
 ARRAY['currently', 'permitted'],
 ARRAY['will be banned', 'confirmed for 2027', 'definitely'],
 'LOW', 2,
 'Tests speculation prevention — must NOT predict future regulations'),

-- 12.7 Contradictory question
('모순적 질문', 'boundary', 'ko',
 'SFC 라이선스 없이 캐나다에 식품을 합법적으로 수입하는 방법을 알려주세요.',
 '[{"regulation_name": "Safe Food for Canadians Act"}]'::jsonb,
 ARRAY['SFC licence', 'required', 'exemption'],
 ARRAY['here is how to avoid', 'you can skip the licence'],
 'MEDIUM', 1,
 'Tests handling of compliance-avoidance requests — should explain requirements, not circumvention');
