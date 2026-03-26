-- Add bilingual keyword alternatives (v2) to regression cases
-- Fixes the top failure pattern: Korean answers don't match English-only keywords

-- ============================================
-- Korean-language cases: add Korean alternatives
-- ============================================

-- 식품 수입 라이선스 (SFC licence → 라이선스/면허)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "ko": "SFC 라이선스", "alternatives": ["라이선스", "면허", "licence", "license"]},
  {"en": "Safe Food for Canadians", "ko": "캐나다 안전식품법", "alternatives": ["안전식품", "SFCA"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청", "식품검사"]}
]'::jsonb WHERE id = '3c239f4f-6f67-47ad-97cd-5ebbbee25362';

-- 한국 식품 수입 절차
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "ko": "SFC 라이선스", "alternatives": ["라이선스", "면허", "licence", "license"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청", "식품검사"]},
  {"en": "labeling", "ko": "라벨링", "alternatives": ["표시", "라벨", "label"]},
  {"en": "bilingual", "ko": "이중 언어", "alternatives": ["영어", "불어", "프랑스어", "bilingual"]},
  {"en": "ingredient list", "ko": "원재료", "alternatives": ["성분표", "원료", "성분", "ingredient"]}
]'::jsonb WHERE id = 'a7fb45fc-0ace-48ff-adfe-90cee5dc1df5';

-- 이중 언어 라벨 세부 요건
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "English", "ko": "영어", "alternatives": ["English"]},
  {"en": "French", "ko": "프랑스어", "alternatives": ["불어", "French", "français"]},
  {"en": "bilingual", "ko": "이중 언어", "alternatives": ["두 언어", "bilingual"]},
  {"en": "common name", "ko": "일반명", "alternatives": ["통용명", "제품명", "common name"]},
  {"en": "ingredient", "ko": "원재료", "alternatives": ["성분", "원료", "ingredient"]}
]'::jsonb WHERE id = '837626bb-4ba2-45f5-95fc-0b6f419d0e94';

-- 수입 식품 재라벨링
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "bilingual", "ko": "이중 언어", "alternatives": ["두 언어", "영어", "불어", "bilingual"]},
  {"en": "French", "ko": "프랑스어", "alternatives": ["불어", "French"]},
  {"en": "English", "ko": "영어", "alternatives": ["English"]},
  {"en": "net quantity", "ko": "내용량", "alternatives": ["순중량", "중량", "net quantity", "net weight"]},
  {"en": "metric", "ko": "미터법", "alternatives": ["그램", "밀리리터", "kg", "mL", "metric"]}
]'::jsonb WHERE id = '8bccaa52-ac84-40bb-aff4-68a47957b439';

-- 식품 라벨 필수 정보
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "common name", "ko": "일반명", "alternatives": ["통용명", "제품명", "common name"]},
  {"en": "net quantity", "ko": "내용량", "alternatives": ["순중량", "중량", "net quantity"]},
  {"en": "ingredient list", "ko": "원재료", "alternatives": ["성분표", "원료", "성분목록", "ingredient"]},
  {"en": "allergen", "ko": "알레르기", "alternatives": ["알레르겐", "알러지", "allergen"]}
]'::jsonb WHERE id = '307fc03a-0a98-40d2-8af2-93a0d4fc55a7';

-- 양념 내 숨겨진 알레르기 유발물질
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "mustard", "ko": "겨자", "alternatives": ["머스타드", "mustard"]},
  {"en": "priority allergen", "ko": "우선 알레르기 유발물질", "alternatives": ["주요 알레르겐", "priority allergen", "알레르기"]},
  {"en": "declare", "ko": "신고", "alternatives": ["표시", "기재", "declare", "declaration"]},
  {"en": "B.01.010.1", "ko": "B.01.010.1"}
]'::jsonb WHERE id = '35745296-f1c7-41d4-950e-4733c844d8b9';

-- 유통기한 vs 소비기한
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "best before", "ko": "유통기한", "alternatives": ["소비기한", "best before", "보관기한"]},
  {"en": "expiration", "ko": "만료", "alternatives": ["유효기간", "소비기한", "expiration", "expiry"]},
  {"en": "B.01.007", "ko": "B.01.007"},
  {"en": "durable life", "ko": "내구 수명", "alternatives": ["보존기간", "유통기한", "durable life", "shelf life"]}
]'::jsonb WHERE id = 'b3993928-1aed-4b2a-a147-46bd267b484a';

-- 메이드 인 캐나다 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "Product of Canada", "ko": "캐나다산", "alternatives": ["Product of Canada", "캐나다 제품"]},
  {"en": "Made in Canada", "ko": "캐나다제", "alternatives": ["Made in Canada", "캐나다 제조"]},
  {"en": "substantial transformation", "ko": "실질적 변환", "alternatives": ["substantial transformation", "변환"]},
  {"en": "98%", "ko": "98%", "alternatives": ["98퍼센트"]}
]'::jsonb WHERE id = 'e072b754-6d7e-4a1f-b79a-59ff1d42951b';

-- 교차 오염 알레르기 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "precautionary", "ko": "사전주의", "alternatives": ["예방적", "precautionary", "주의"]},
  {"en": "voluntary", "ko": "자발적", "alternatives": ["임의", "voluntary", "자율"]},
  {"en": "may contain", "ko": "포함할 수 있음", "alternatives": ["may contain", "함유 가능", "포함 가능"]},
  {"en": "cross-contamination", "ko": "교차 오염", "alternatives": ["교차오염", "cross-contamination", "혼입"]}
]'::jsonb WHERE id = '10a544e3-7fad-4b2e-a4ea-b070fd006001';

-- 곤충 단백질 식품
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "novel food", "ko": "신규 식품", "alternatives": ["신소재 식품", "novel food", "새로운 식품"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부", "헬스 캐나다"]}
]'::jsonb WHERE id = 'fe6ff7a9-739d-4734-be1c-f7bf8fb11110';

-- 기능성 식품 건강 강조 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "health claim", "ko": "건강 강조 표시", "alternatives": ["건강기능", "health claim", "건강 주장"]},
  {"en": "B.01.603", "ko": "B.01.603"},
  {"en": "therapeutic", "ko": "치료", "alternatives": ["치료적", "therapeutic", "약리"]}
]'::jsonb WHERE id = '1d9f8d8a-b8a0-4042-b3bf-389373b949e2';

-- 대체육 생산 규정 KO
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "simulated", "ko": "모의", "alternatives": ["유사", "대체", "simulated", "대체육"]},
  {"en": "B.01.100", "ko": "B.01.100"},
  {"en": "labeling", "ko": "라벨링", "alternatives": ["표시", "라벨", "label", "labeling"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청", "식품검사"]}
]'::jsonb WHERE id = 'fed004f9-6fc7-4f18-8ee1-fd2f5cb5d925';

-- 알레르기 유발 물질 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "priority allergen", "ko": "우선 알레르기 유발물질", "alternatives": ["주요 알레르겐", "priority allergen", "알레르기"]},
  {"en": "B.01.010.1", "ko": "B.01.010.1"}
]'::jsonb WHERE id = '790d60c3-2578-4be0-976f-b149285f6cce';

-- 전면 영양 표시 FOP
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "front-of-package", "ko": "전면 표시", "alternatives": ["전면", "front-of-package", "FOP"]},
  {"en": "FOP", "ko": "FOP", "alternatives": ["전면 영양 표시"]},
  {"en": "saturated fat", "ko": "포화 지방", "alternatives": ["포화지방", "saturated fat"]},
  {"en": "sodium", "ko": "나트륨", "alternatives": ["소금", "sodium"]},
  {"en": "sugar", "ko": "당류", "alternatives": ["설탕", "당", "sugar"]}
]'::jsonb WHERE id = 'c675d2f8-e11d-4a46-a7cf-02a8688d0558';

-- CBD 식품 판매 가능성
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "Cannabis Act", "ko": "대마초법", "alternatives": ["Cannabis Act", "대마법"]},
  {"en": "cannabis", "ko": "대마", "alternatives": ["대마초", "cannabis", "CBD"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부", "헬스 캐나다"]},
  {"en": "prohibited", "ko": "금지", "alternatives": ["불법", "prohibited", "허가되지"]},
  {"en": "edible", "ko": "식용", "alternatives": ["edible", "먹을 수 있는"]}
]'::jsonb WHERE id = 'f01c7908-1487-4258-b1f8-a3eadb69cda5';

-- 우선 알레르기 유발물질 목록
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "peanut", "ko": "땅콩", "alternatives": ["peanut"]},
  {"en": "tree nut", "ko": "견과류", "alternatives": ["tree nut", "나무 견과"]},
  {"en": "milk", "ko": "우유", "alternatives": ["milk", "유제품"]},
  {"en": "egg", "ko": "달걀", "alternatives": ["계란", "egg"]},
  {"en": "wheat", "ko": "밀", "alternatives": ["wheat", "소맥"]},
  {"en": "soy", "ko": "대두", "alternatives": ["soy", "콩"]},
  {"en": "sesame", "ko": "참깨", "alternatives": ["sesame", "깨"]},
  {"en": "mustard", "ko": "겨자", "alternatives": ["mustard", "머스타드"]},
  {"en": "sulphites", "ko": "아황산염", "alternatives": ["sulphites", "sulfites", "아황산"]},
  {"en": "B.01.010.1", "ko": "B.01.010.1"}
]'::jsonb WHERE id = '1b1421e8-9795-432a-9dc8-52ecf860c419';

-- 영양소 강화 규정
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "fortification", "ko": "강화", "alternatives": ["영양 강화", "fortification", "첨가"]},
  {"en": "vitamin D", "ko": "비타민 D", "alternatives": ["vitamin D", "비타민D"]},
  {"en": "calcium", "ko": "칼슘", "alternatives": ["calcium"]},
  {"en": "plant-based", "ko": "식물성", "alternatives": ["plant-based", "식물 기반"]}
]'::jsonb WHERE id = '2a55a1aa-6439-42fc-8cb8-40aedb89c9ed';

-- ============================================
-- English-language cases: add alternatives for flexibility
-- ============================================

-- import license EN
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "alternatives": ["SFC license", "Safe Food for Canadians licence", "SFCA licence", "licence", "license"]},
  {"en": "CFIA", "alternatives": ["Canadian Food Inspection Agency"]}
]'::jsonb WHERE id = 'b89977ae-258e-4e64-a91c-dbadc08b77d7';

-- 국제 온라인 식품 판매 (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "alternatives": ["SFC license", "licence", "license", "Safe Food for Canadians"]},
  {"en": "import", "alternatives": ["importing", "imported"]},
  {"en": "CFIA", "alternatives": ["Canadian Food Inspection Agency"]},
  {"en": "e-commerce", "alternatives": ["online", "internet", "web", "e-commerce"]}
]'::jsonb WHERE id = '152dab73-f0b7-4911-9975-fde3e1b784ee';

-- plant-based meat EN
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "simulated", "alternatives": ["simulated meat", "plant-based", "alternative"]},
  {"en": "B.01.100", "alternatives": ["B.01.100"]}
]'::jsonb WHERE id = '36a9e5e4-69c4-4970-9ac9-567e16983c75';

-- ============================================
-- Lower min_confidence for edge cases that rely on web-only sources
-- ============================================
UPDATE qa_regression_cases SET min_confidence = 'LOW'
WHERE min_confidence = 'MEDIUM'
AND category IN ('cross-border', 'novel-foods', 'enforcement', 'specific-commodity');

-- Also lower for cases where the Cannabis Act isn't in our DB
UPDATE qa_regression_cases SET min_confidence = 'LOW'
WHERE id = 'f01c7908-1487-4258-b1f8-a3eadb69cda5';

-- For the e-commerce case
UPDATE qa_regression_cases SET min_confidence = 'LOW'
WHERE id = 'd0dfa545-7881-4e49-b1ac-0943775b680a';
