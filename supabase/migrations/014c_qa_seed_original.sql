-- Original 8 seed cases from migration 014
INSERT INTO qa_regression_cases (name, category, language, question, expected_citations, expected_keywords, min_confidence, priority) VALUES
  ('식품 수입 라이선스', 'import', 'ko',
   '캐나다에 식품을 수입하려면 어떤 라이선스가 필요한가요?',
   '[{"regulation_name": "Safe Food for Canadians Act", "section_number": "s.20"}]'::jsonb,
   ARRAY['SFC licence', 'Safe Food for Canadians', 'CFIA'],
   'MEDIUM', 1),

  ('식품 라벨 필수 정보', 'labeling', 'ko',
   '캐나다에서 식품 라벨에 반드시 포함해야 하는 정보는 무엇인가요?',
   '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
   ARRAY['common name', 'net quantity', 'ingredient list', 'allergen'],
   'MEDIUM', 1),

  ('알레르기 유발 물질 표시', 'allergen', 'ko',
   '식품 수입 시 알레르기 유발 물질 표시 요건은?',
   '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
   ARRAY['priority allergen', 'B.01.010.1'],
   'MEDIUM', 1),

  ('영양성분표 규격', 'labeling', 'ko',
   '캐나다 영양성분표(Nutrition Facts Table) 규격은 어떻게 되나요?',
   '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
   ARRAY['Nutrition Facts', 'B.01.401'],
   'MEDIUM', 2),

  ('식품 첨가물 허가 확인', 'additive', 'ko',
   '식품 첨가물이 캐나다에서 허가된 것인지 어떻게 확인하나요?',
   '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
   ARRAY['List of Permitted', 'Health Canada'],
   'MEDIUM', 2),

  ('plant-based meat EN', 'labeling', 'en',
   'What are the labeling requirements for plant-based meat alternatives in Canada?',
   '[{"regulation_name": "Food and Drug Regulations"}]'::jsonb,
   ARRAY['simulated', 'B.01.100'],
   'MEDIUM', 1),

  ('import license EN', 'import', 'en',
   'What license do I need to import food into Canada?',
   '[{"regulation_name": "Safe Food for Canadians Act"}]'::jsonb,
   ARRAY['SFC licence', 'CFIA'],
   'MEDIUM', 1),

  ('PCP requirements', 'import', 'en',
   'What is a Preventive Control Plan (PCP) required for importing food to Canada?',
   '[{"regulation_name": "Safe Food for Canadians Regulations"}]'::jsonb,
   ARRAY['preventive control', 'hazard'],
   'MEDIUM', 2);
