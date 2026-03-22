-- ============================================
-- Market Products (for cross-check)
-- ============================================
CREATE TABLE market_products (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_name      TEXT NOT NULL,
  brand             TEXT,
  category          TEXT NOT NULL,
  subcategory       TEXT,
  origin_country    TEXT,
  retailer          TEXT,
  product_url       TEXT,
  din_npn           TEXT,
  ingredients       TEXT[],
  compliance_notes  TEXT,
  is_recalled       BOOLEAN DEFAULT false,
  recall_details    TEXT,
  last_verified     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_market_category ON market_products(category);
CREATE INDEX idx_market_origin ON market_products(origin_country);
CREATE INDEX idx_market_name_search ON market_products
  USING gin(to_tsvector('english', product_name));

-- ============================================
-- Compliance Checklist Templates
-- ============================================
CREATE TABLE checklist_templates (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_en           TEXT NOT NULL,
  name_ko           TEXT,
  description_en    TEXT,
  description_ko    TEXT,
  product_category  TEXT NOT NULL,
  activity_type     TEXT NOT NULL CHECK (activity_type IN ('production', 'import', 'export', 'labeling', 'general')),
  import_origin     TEXT DEFAULT 'KR',
  is_verified       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Checklist Items
-- ============================================
CREATE TABLE checklist_items (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id           UUID REFERENCES checklist_templates(id) ON DELETE CASCADE NOT NULL,
  regulation_section_id UUID REFERENCES regulation_sections(id),
  order_index           INTEGER NOT NULL,
  requirement_en        TEXT NOT NULL,
  requirement_ko        TEXT,
  description_en        TEXT,
  description_ko        TEXT,
  is_mandatory          BOOLEAN DEFAULT true,
  verification_method   TEXT,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_checklist_items_template ON checklist_items(template_id);

-- ============================================
-- Q&A Sessions (audit trail)
-- ============================================
CREATE TABLE qa_sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question        TEXT NOT NULL,
  answer          TEXT NOT NULL,
  citations       JSONB NOT NULL DEFAULT '[]',
  verification    JSONB NOT NULL DEFAULT '{}',
  market_check    JSONB DEFAULT '{}',
  confidence      TEXT NOT NULL CHECK (confidence IN ('HIGH', 'MEDIUM', 'LOW', 'UNVERIFIED')),
  language        TEXT DEFAULT 'ko',
  processing_time_ms INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_qa_sessions_confidence ON qa_sessions(confidence);
CREATE INDEX idx_qa_sessions_created ON qa_sessions(created_at DESC);
