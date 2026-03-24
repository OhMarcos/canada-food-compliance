-- ============================================
-- Data Flywheel: Analytics & Intelligence
-- ============================================

-- 1. Unified analytics event log
-- Captures all feature usage, errors, and performance metrics.
-- JSONB metadata keeps it flexible without schema changes.
CREATE TABLE analytics_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id        TEXT NOT NULL,
  event_type        TEXT NOT NULL,
  event_action      TEXT NOT NULL,
  language          TEXT DEFAULT 'en',
  processing_time_ms INTEGER,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_analytics_events_type_time ON analytics_events(event_type, created_at DESC);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id, created_at DESC);

-- 2. Content gap signals (flywheel Loop 1)
-- Auto-detected when confidence is low or no relevant contexts found.
CREATE TABLE content_gap_signals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query             TEXT NOT NULL,
  query_language    TEXT DEFAULT 'en',
  confidence        DECIMAL(3,2),
  retrieval_score   DECIMAL(3,2),
  contexts_found    INTEGER DEFAULT 0,
  gap_type          TEXT NOT NULL,
  matched_topics    TEXT[],
  created_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_content_gaps_type_time ON content_gap_signals(gap_type, created_at DESC);

-- 3. Extend qa_sessions with flywheel columns
ALTER TABLE qa_sessions ADD COLUMN IF NOT EXISTS session_id TEXT;
ALTER TABLE qa_sessions ADD COLUMN IF NOT EXISTS retrieval_score DECIMAL(3,2);
ALTER TABLE qa_sessions ADD COLUMN IF NOT EXISTS contexts_found INTEGER;
ALTER TABLE qa_sessions ADD COLUMN IF NOT EXISTS topics_matched TEXT[];
