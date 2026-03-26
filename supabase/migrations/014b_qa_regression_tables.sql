-- Create regression testing tables (qa_sessions already exists from 014)

CREATE TABLE IF NOT EXISTS qa_regression_cases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name              TEXT NOT NULL,
  description       TEXT,
  category          TEXT NOT NULL,
  language          TEXT NOT NULL DEFAULT 'ko',
  question          TEXT NOT NULL,
  expected_citations JSONB DEFAULT '[]',
  expected_keywords  TEXT[],
  forbidden_keywords TEXT[],
  min_confidence    TEXT DEFAULT 'MEDIUM',
  is_active         BOOLEAN DEFAULT true,
  priority          INTEGER DEFAULT 1,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regression_cases_active ON qa_regression_cases(is_active, category);

CREATE TABLE IF NOT EXISTS qa_regression_runs (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_label         TEXT,
  total_cases       INTEGER NOT NULL,
  passed_count      INTEGER DEFAULT 0,
  failed_count      INTEGER DEFAULT 0,
  skipped_count     INTEGER DEFAULT 0,
  avg_confidence_score DECIMAL(3,2),
  avg_processing_ms    INTEGER,
  started_at        TIMESTAMPTZ DEFAULT now(),
  completed_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS qa_regression_results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id            UUID NOT NULL REFERENCES qa_regression_runs(id) ON DELETE CASCADE,
  case_id           UUID NOT NULL REFERENCES qa_regression_cases(id) ON DELETE CASCADE,
  qa_session_id     UUID REFERENCES qa_sessions(id),
  status            TEXT NOT NULL,
  citation_match    BOOLEAN,
  keyword_match     BOOLEAN,
  forbidden_clear   BOOLEAN,
  confidence_met    BOOLEAN,
  actual_answer     TEXT,
  actual_confidence TEXT,
  failure_reasons   TEXT[],
  processing_time_ms INTEGER,
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regression_results_run ON qa_regression_results(run_id, status);

-- RLS
ALTER TABLE qa_regression_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_regression_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE qa_regression_results ENABLE ROW LEVEL SECURITY;

-- Service role policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on qa_regression_cases') THEN
    CREATE POLICY "Service role full access on qa_regression_cases"
      ON qa_regression_cases FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on qa_regression_runs') THEN
    CREATE POLICY "Service role full access on qa_regression_runs"
      ON qa_regression_runs FOR ALL USING (auth.role() = 'service_role');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Service role full access on qa_regression_results') THEN
    CREATE POLICY "Service role full access on qa_regression_results"
      ON qa_regression_results FOR ALL USING (auth.role() = 'service_role');
  END IF;
END $$;
