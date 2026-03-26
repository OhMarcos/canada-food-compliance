-- Enhanced scoring schema for regression testing
-- Adds bilingual keyword support, weighted scoring, and quality metrics

-- ============================================
-- qa_regression_cases: bilingual keywords + scoring weights
-- ============================================
ALTER TABLE qa_regression_cases
  ADD COLUMN IF NOT EXISTS expected_keywords_v2 JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS forbidden_keywords_v2 JSONB DEFAULT '[]',
  ADD COLUMN IF NOT EXISTS scoring_weights JSONB DEFAULT NULL;

COMMENT ON COLUMN qa_regression_cases.expected_keywords_v2 IS 'Bilingual keywords: [{en: string, ko?: string, alternatives?: string[]}]';
COMMENT ON COLUMN qa_regression_cases.forbidden_keywords_v2 IS 'Bilingual forbidden keywords: same schema as expected_keywords_v2';
COMMENT ON COLUMN qa_regression_cases.scoring_weights IS 'Custom weights: {citation_weight, keyword_weight, forbidden_weight, confidence_weight} summing to 1.0';

-- ============================================
-- qa_regression_results: quality score + breakdown
-- ============================================
ALTER TABLE qa_regression_results
  ADD COLUMN IF NOT EXISTS quality_score INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS score_breakdown JSONB DEFAULT NULL;

COMMENT ON COLUMN qa_regression_results.quality_score IS 'Weighted quality score 0-100';
COMMENT ON COLUMN qa_regression_results.score_breakdown IS '{citation: 0-100, keyword: 0-100, forbidden: 0-100, confidence: 0-100}';

-- ============================================
-- qa_regression_runs: avg quality score
-- ============================================
ALTER TABLE qa_regression_runs
  ADD COLUMN IF NOT EXISTS avg_quality_score INTEGER DEFAULT 0;
