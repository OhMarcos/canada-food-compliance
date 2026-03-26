-- ============================================
-- QA Monitoring & Regression Testing System
-- ============================================

-- 1. QA Sessions: Full replay of every Q&A interaction
-- Captures: question → raw answer → clean answer → citations → quality signals
CREATE TABLE qa_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        TEXT NOT NULL,
  user_id           UUID,

  -- Input
  question          TEXT NOT NULL,
  language          TEXT NOT NULL DEFAULT 'ko',
  history_turns     INTEGER DEFAULT 0,

  -- RAG context
  contexts_found    INTEGER DEFAULT 0,
  best_retrieval_score DECIMAL(3,2),
  matched_topics    TEXT[],

  -- LLM output
  raw_answer        TEXT NOT NULL,
  clean_answer      TEXT NOT NULL,
  citations_count   INTEGER DEFAULT 0,
  citations         JSONB DEFAULT '[]',

  -- Verification
  confidence        TEXT,  -- HIGH, MEDIUM, LOW, UNVERIFIED
  accuracy_score    DECIMAL(3,2),
  verified_count    INTEGER DEFAULT 0,
  flagged_count     INTEGER DEFAULT 0,
  verifier_notes    TEXT,

  -- Quality classification (auto or manual)
  quality_grade     TEXT,  -- A, B, C, D, F
  failure_type      TEXT,  -- null = success | citation_leak | no_context | hallucination | wrong_law | incomplete | format_error
  failure_notes     TEXT,
  reviewed_by       TEXT,  -- null = auto, 'admin' = manual review
  reviewed_at       TIMESTAMPTZ,

  -- Performance
  processing_time_ms INTEGER,
  endpoint          TEXT DEFAULT 'stream',  -- 'stream' | 'non-stream'

  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qa_sessions_time ON qa_sessions(created_at DESC);
CREATE INDEX idx_qa_sessions_quality ON qa_sessions(quality_grade, created_at DESC);
CREATE INDEX idx_qa_sessions_failure ON qa_sessions(failure_type, created_at DESC) WHERE failure_type IS NOT NULL;
CREATE INDEX idx_qa_sessions_confidence ON qa_sessions(confidence, created_at DESC);
CREATE INDEX idx_qa_sessions_session ON qa_sessions(session_id, created_at DESC);

-- 2. Regression Test Cases: Golden Q&A pairs for quality tracking
CREATE TABLE qa_regression_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Test definition
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,  -- labeling, import, allergen, nft, additive, general
  language          TEXT NOT NULL DEFAULT 'ko',

  -- Input
  question          TEXT NOT NULL,

  -- Expected output criteria
  expected_citations JSONB DEFAULT '[]',  -- [{regulation_name, section_number}]
  expected_keywords  TEXT[],              -- Must appear in answer
  forbidden_keywords TEXT[],              -- Must NOT appear in answer
  min_confidence    TEXT DEFAULT 'MEDIUM', -- Minimum acceptable confidence

  -- Metadata
  is_active         BOOLEAN DEFAULT true,
  priority          INTEGER DEFAULT 1,    -- 1=critical, 2=important, 3=nice-to-have
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_regression_cases_active ON qa_regression_cases(is_active, category);

-- 3. Regression Test Runs: Track each test execution
CREATE TABLE qa_regression_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Run metadata
  run_label         TEXT,                 -- e.g. 'v1.2.0', 'prompt-update-2024-03'
  total_cases       INTEGER NOT NULL,
  passed_count      INTEGER DEFAULT 0,
  failed_count      INTEGER DEFAULT 0,
  skipped_count     INTEGER DEFAULT 0,

  -- Aggregate quality
  avg_confidence_score DECIMAL(3,2),
  avg_processing_ms    INTEGER,

  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

-- 4. Regression Test Results: Per-case results within a run
CREATE TABLE qa_regression_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            UUID NOT NULL REFERENCES qa_regression_runs(id) ON DELETE CASCADE,
  case_id           UUID NOT NULL REFERENCES qa_regression_cases(id) ON DELETE CASCADE,
  qa_session_id     UUID REFERENCES qa_sessions(id),

  -- Result
  status            TEXT NOT NULL,  -- passed | failed | error

  -- Checks
  citation_match    BOOLEAN,
  keyword_match     BOOLEAN,
  forbidden_clear   BOOLEAN,
  confidence_met    BOOLEAN,

  -- Details
  actual_answer     TEXT,
  actual_confidence TEXT,
  failure_reasons   TEXT[],

  processing_time_ms INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_regression_results_run ON qa_regression_results(run_id, status);

-- 5. RLS policies (admin-only for QA tables)
ALTER TABLE qa_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_regression_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_regression_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_regression_results ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (admin operations)
CREATE POLICY "Service role full access on qa_sessions"
  ON qa_sessions FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_regression_cases"
  ON qa_regression_cases FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_regression_runs"
  ON qa_regression_runs FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on qa_regression_results"
  ON qa_regression_results FOR ALL
  USING (auth.role() = 'service_role');

-- 6. Seed initial regression test cases
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
