-- Bilingual keyword alternatives batch 2

-- 영유아 식품 규정
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "infant", "ko": "영유아", "alternatives": ["유아", "아기", "infant"]},
  {"en": "B.25", "ko": "B.25"},
  {"en": "formulated", "ko": "조제", "alternatives": ["formulated", "배합"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]}
]'::jsonb WHERE id = 'ede3b973-1813-480a-b661-54e5d4b3bae5';

-- 허브차 건강 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "health claim", "ko": "건강 강조", "alternatives": ["건강 주장", "health claim", "건강기능"]},
  {"en": "therapeutic", "ko": "치료", "alternatives": ["치료적", "therapeutic", "약리"]},
  {"en": "NHP", "ko": "NHP", "alternatives": ["천연건강제품", "Natural Health Product"]},
  {"en": "DIN", "ko": "DIN", "alternatives": ["의약품 식별번호"]}
]'::jsonb WHERE id = '051a2c11-18b9-409a-864d-8bb87a858452';

-- 미국 규정 혼동
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "캐나다", "alternatives": ["Canada", "Canadian"]},
  {"en": "Canada", "ko": "캐나다"},
  {"en": "different", "ko": "다른", "alternatives": ["차이", "다르", "different", "구별"]}
]'::jsonb WHERE id = '6a339965-5844-412a-beea-22e344579ade';

-- 복합 질문
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "labeling", "ko": "라벨링", "alternatives": ["표시", "라벨", "label"]},
  {"en": "additive", "ko": "첨가물", "alternatives": ["additive", "식품첨가물"]},
  {"en": "best before", "ko": "유통기한", "alternatives": ["소비기한", "best before"]},
  {"en": "import", "ko": "수입", "alternatives": ["import", "수입하"]}
]'::jsonb WHERE id = 'a563a56a-991c-475c-b49b-7cefd80beffa';

-- 법률 자문 요청
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "법률 자문", "alternatives": ["법적 조언", "법률 상담"]},
  {"en": "legal advice", "ko": "법률 자문", "alternatives": ["법률 상담", "legal"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]}
]'::jsonb WHERE id = '1a367978-9063-40ba-b139-c26404a65c76';

-- 모순적 질문
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "ko": "SFC 라이선스", "alternatives": ["라이선스", "면허", "licence", "license"]},
  {"en": "required", "ko": "필요", "alternatives": ["필수", "required", "의무"]},
  {"en": "exemption", "ko": "면제", "alternatives": ["예외", "exemption", "제외"]}
]'::jsonb WHERE id = '3db5de5c-575e-4bcd-a60f-d8149392e6c9';

-- 가정 주방 식품 판매
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "exemption", "ko": "면제", "alternatives": ["예외", "exemption", "제외"]},
  {"en": "interprovincial", "ko": "주간", "alternatives": ["주 간", "interprovincial", "도간"]},
  {"en": "provincial", "ko": "주", "alternatives": ["provincial", "지방"]}
]'::jsonb WHERE id = '5df9479c-5f6b-4df0-b8ee-9a1b233d53a6';

-- 발효 식품 규정
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "fermented", "ko": "발효", "alternatives": ["fermented"]},
  {"en": "probiotic", "ko": "프로바이오틱", "alternatives": ["유산균", "probiotic"]},
  {"en": "health claim", "ko": "건강 강조", "alternatives": ["건강 주장", "health claim"]}
]'::jsonb WHERE id = '5818a9c9-1d4e-4fba-98ff-e864fe20a2b8';

-- 식품 vs 천연건강제품 구분
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "NHP", "ko": "NHP", "alternatives": ["천연건강제품", "Natural Health Product"]},
  {"en": "Natural Health Product", "ko": "천연건강제품", "alternatives": ["NHP"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]},
  {"en": "therapeutic", "ko": "치료", "alternatives": ["치료적", "therapeutic"]}
]'::jsonb WHERE id = '20aa6ef0-5afc-461a-9dc8-cace316b5ccd';

-- 완전히 무관한 질문
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "식품", "alternatives": ["food", "음식"]},
  {"en": "범위", "alternatives": ["scope", "영역", "범위 밖"]}
]'::jsonb WHERE id = '717fb639-4870-447c-8061-c8d1e3d39b37';

-- 식품 리콜 절차
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "recall", "ko": "리콜", "alternatives": ["회수", "recall"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]},
  {"en": "mandatory", "ko": "의무", "alternatives": ["필수", "mandatory"]},
  {"en": "traceability", "ko": "이력 추적", "alternatives": ["추적", "traceability", "추적성"]}
]'::jsonb WHERE id = '6a15994f-2826-4465-b4d9-49e490aca6f3';

-- 유기농 인증
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "organic", "ko": "유기농", "alternatives": ["organic", "유기"]},
  {"en": "certification", "ko": "인증", "alternatives": ["certification", "인증서"]},
  {"en": "Canada Organic", "ko": "캐나다 유기농", "alternatives": ["Canada Organic", "유기농 로고"]}
]'::jsonb WHERE id = 'd3e2b8af-a1d9-41ed-86c6-0143ca181974';

-- 온라인 식품 라벨 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "e-commerce", "ko": "전자상거래", "alternatives": ["온라인", "e-commerce", "인터넷"]},
  {"en": "label", "ko": "라벨", "alternatives": ["표시", "label"]},
  {"en": "online", "ko": "온라인", "alternatives": ["인터넷", "online", "웹"]}
]'::jsonb WHERE id = 'd0dfa545-7881-4e49-b1ac-0943775b680a';

-- 비유전자변형 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "GMO", "ko": "GMO", "alternatives": ["유전자변형", "유전자 변형"]},
  {"en": "voluntary", "ko": "자발적", "alternatives": ["임의", "voluntary", "자율"]},
  {"en": "misleading", "ko": "오해", "alternatives": ["오도", "misleading", "허위"]}
]'::jsonb WHERE id = '05a57490-a7ce-479c-9e40-8035d967120c';

-- 할랄 코셔 인증 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "Halal", "ko": "할랄", "alternatives": ["Halal"]},
  {"en": "Kosher", "ko": "코셔", "alternatives": ["Kosher"]},
  {"en": "certification", "ko": "인증", "alternatives": ["certification", "인증서"]}
]'::jsonb WHERE id = '1911a90d-7a5f-4dee-a653-6d63f5d6a104';

-- 수산물 종 명칭 (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "common name", "alternatives": ["common name", "product name"]},
  {"en": "fish", "alternatives": ["fish", "seafood"]},
  {"en": "species", "alternatives": ["species", "variety"]}
]'::jsonb WHERE id = '37689e6d-58cf-4577-abc6-504293ba585e';

-- 꿀 등급 표시
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "honey", "ko": "꿀", "alternatives": ["honey"]},
  {"en": "grade", "ko": "등급", "alternatives": ["grade", "분류"]},
  {"en": "Canada No. 1", "ko": "캐나다 1등급", "alternatives": ["Canada No. 1", "1등급"]}
]'::jsonb WHERE id = '80be05fb-9a45-4174-8af7-8ef0482fe0ee';

-- 식품 구독 서비스 규정
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "SFC licence", "ko": "SFC 라이선스", "alternatives": ["라이선스", "면허", "licence"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]},
  {"en": "labeling", "ko": "라벨링", "alternatives": ["표시", "라벨", "label"]},
  {"en": "traceability", "ko": "이력 추적", "alternatives": ["추적", "traceability"]}
]'::jsonb WHERE id = 'd3519a27-c0a4-4d8d-b39e-a5ccdcb4af97';

-- 밀키트 규정 (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "meal kit", "alternatives": ["meal kit", "kit"]},
  {"en": "labeling", "alternatives": ["labeling", "labelling", "label"]},
  {"en": "prepackaged", "alternatives": ["prepackaged", "pre-packaged", "packaged"]},
  {"en": "CFIA", "alternatives": ["Canadian Food Inspection Agency"]}
]'::jsonb WHERE id = '2b2997ac-d302-4879-92cf-d35e7c68dab0';

-- CFIA 검사 권한 (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "inspector", "alternatives": ["inspector", "inspection officer"]},
  {"en": "inspection", "alternatives": ["inspection", "inspect"]},
  {"en": "seize", "alternatives": ["seize", "seizure", "detain"]},
  {"en": "SFCA", "alternatives": ["SFCA", "Safe Food for Canadians Act"]}
]'::jsonb WHERE id = '2663764f-f9c7-4601-aba2-94111b2ed2bb';

-- 보충제 표시 vs 영양성분표
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "Nutrition Facts", "ko": "영양성분표", "alternatives": ["Nutrition Facts", "영양 정보"]},
  {"en": "Supplement Facts", "ko": "보충제 정보", "alternatives": ["Supplement Facts"]},
  {"en": "NHP", "ko": "NHP", "alternatives": ["천연건강제품"]},
  {"en": "classification", "ko": "분류", "alternatives": ["구분", "classification"]}
]'::jsonb WHERE id = '047e1d2f-d063-4eae-a36c-cf0818f0402e';

-- 극도로 모호한 질문
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "라벨", "alternatives": ["label", "표시"]},
  {"en": "label", "ko": "라벨", "alternatives": ["표시", "라벨링"]}
]'::jsonb WHERE id = '0ab37c31-b66f-436c-bcc2-a9d9810b31b7';

-- 가상의 미래 규정 (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "currently", "alternatives": ["current", "currently", "existing"]},
  {"en": "permitted", "alternatives": ["permitted", "allowed", "legal"]}
]'::jsonb WHERE id = 'b451bc01-6379-433a-b37c-e3465148fc80';

-- 영양성분표 규격
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "Nutrition Facts", "ko": "영양성분표", "alternatives": ["Nutrition Facts", "영양 정보"]},
  {"en": "B.01.401", "ko": "B.01.401"}
]'::jsonb WHERE id = '3dd9b4e3-d755-4ba5-bb9c-a8734c6e1302';

-- 식품 첨가물 허가 확인
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "List of Permitted", "ko": "허가 목록", "alternatives": ["허용 목록", "List of Permitted", "허가된"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]}
]'::jsonb WHERE id = '39d72a8c-9aa6-4a44-9a85-54083459002a';

-- 배양육 규제 현황
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "novel food", "ko": "신규 식품", "alternatives": ["신소재 식품", "novel food"]},
  {"en": "Health Canada", "ko": "Health Canada", "alternatives": ["캐나다 보건부"]},
  {"en": "pre-market", "ko": "시판 전", "alternatives": ["사전 승인", "pre-market", "시장 출시 전"]}
]'::jsonb WHERE id = '11af1942-0ec5-4577-af90-de50da46096f';

-- 알코올 함유 식품
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "alcohol", "ko": "알코올", "alternatives": ["알콜", "alcohol", "주류"]},
  {"en": "percentage", "ko": "퍼센트", "alternatives": ["함량", "percentage", "%", "도수"]}
]'::jsonb WHERE id = 'e4e0dfd2-ef1e-454d-81bb-b8d8dbb5963d';

-- 이력 추적 요건
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "traceability", "ko": "이력 추적", "alternatives": ["추적", "traceability", "추적성"]},
  {"en": "one step", "ko": "원스텝", "alternatives": ["한 단계", "one step", "one-up one-down"]},
  {"en": "record", "ko": "기록", "alternatives": ["record", "문서"]},
  {"en": "SFCR", "ko": "SFCR"}
]'::jsonb WHERE id = 'c7aef789-d1fa-4989-9f5b-1d2f562ed375';

-- PCP requirements (EN)
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "preventive control", "alternatives": ["preventive control", "PCP", "preventive"]},
  {"en": "hazard", "alternatives": ["hazard", "risk", "hazard analysis"]}
]'::jsonb WHERE id = 'a4e6cacc-eff3-4ed0-9f6d-52b25ae9cea9';

-- 육류 수입 국가 제한
UPDATE qa_regression_cases SET expected_keywords_v2 = '[
  {"en": "approved country", "ko": "승인 국가", "alternatives": ["승인된 국가", "approved country", "수출 허가"]},
  {"en": "CFIA", "ko": "CFIA", "alternatives": ["캐나다 식품검사청"]},
  {"en": "meat", "ko": "육류", "alternatives": ["고기", "meat", "축산물"]},
  {"en": "inspection", "ko": "검사", "alternatives": ["검역", "inspection"]}
]'::jsonb WHERE id = '63c14a2a-cb33-4414-8a87-e45bf8ccb291';
