-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "vector";

-- ============================================
-- Regulatory Agencies
-- ============================================
CREATE TABLE agencies (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     TEXT NOT NULL,
  name_ko     TEXT NOT NULL,
  acronym     TEXT NOT NULL UNIQUE,
  website_url TEXT NOT NULL,
  jurisdiction TEXT NOT NULL DEFAULT 'federal',  -- federal, provincial, international
  description_en TEXT,
  description_ko TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Regulations (Acts, Regulations, Guidelines)
-- ============================================
CREATE TABLE regulations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agency_id       UUID REFERENCES agencies(id) NOT NULL,
  title_en        TEXT NOT NULL,
  title_ko        TEXT,
  short_name      TEXT NOT NULL UNIQUE,
  statute_type    TEXT NOT NULL CHECK (statute_type IN ('act', 'regulation', 'policy', 'guideline', 'standard')),
  official_url    TEXT NOT NULL,
  gazette_citation TEXT,                -- e.g., 'S.C. 2012, c. 24'
  effective_date  DATE,
  last_amended    DATE,
  is_active       BOOLEAN DEFAULT true,
  applies_to      TEXT[] DEFAULT '{}',  -- e.g., {'production', 'import', 'labeling'}
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- Regulation Sections (hierarchical)
-- ============================================
CREATE TABLE regulation_sections (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  regulation_id     UUID REFERENCES regulations(id) ON DELETE CASCADE NOT NULL,
  parent_section_id UUID REFERENCES regulation_sections(id) ON DELETE CASCADE,
  section_number    TEXT NOT NULL,
  title_en          TEXT NOT NULL,
  title_ko          TEXT,
  content_en        TEXT NOT NULL,
  content_ko        TEXT,
  section_url       TEXT,
  topics            TEXT[] DEFAULT '{}',
  applies_to        TEXT[] DEFAULT '{}',
  depth_level       INTEGER DEFAULT 0,
  sort_order        INTEGER DEFAULT 0,
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now(),
  UNIQUE(regulation_id, section_number)
);

-- ============================================
-- Vector Embeddings for RAG
-- ============================================
CREATE TABLE regulation_chunks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id      UUID REFERENCES regulation_sections(id) ON DELETE CASCADE NOT NULL,
  chunk_text      TEXT NOT NULL,
  chunk_index     INTEGER NOT NULL,
  embedding       VECTOR(1536),
  metadata        JSONB DEFAULT '{}',
  created_at      TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_chunks_embedding ON regulation_chunks
  USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

CREATE INDEX idx_chunks_section ON regulation_chunks(section_id);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_regulations_agency ON regulations(agency_id);
CREATE INDEX idx_regulations_type ON regulations(statute_type);
CREATE INDEX idx_regulations_active ON regulations(is_active);
CREATE INDEX idx_sections_regulation ON regulation_sections(regulation_id);
CREATE INDEX idx_sections_parent ON regulation_sections(parent_section_id);
CREATE INDEX idx_sections_topics ON regulation_sections USING gin(topics);
CREATE INDEX idx_sections_applies_to ON regulation_sections USING gin(applies_to);

-- Full text search index
CREATE INDEX idx_sections_content_search ON regulation_sections
  USING gin(to_tsvector('english', content_en));
