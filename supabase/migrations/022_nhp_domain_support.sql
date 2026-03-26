-- ============================================
-- Migration 022: NHP (Natural Health Products) Domain Support
--
-- Adds product_domain column to separate Food vs NHP regulations.
-- Canada legally distinguishes Food (CFIA/SFCA/SFCR) from NHP (Health Canada NNHPD/SOR-2003-196).
-- The presence of therapeutic health claims is the primary legal boundary.
-- ============================================

-- Add product_domain to regulations table
ALTER TABLE regulations
  ADD COLUMN IF NOT EXISTS product_domain TEXT NOT NULL DEFAULT 'food'
  CHECK (product_domain IN ('food', 'nhp', 'both'));

-- Add product_domain to regulation_sections for fine-grained filtering
ALTER TABLE regulation_sections
  ADD COLUMN IF NOT EXISTS product_domain TEXT NOT NULL DEFAULT 'food'
  CHECK (product_domain IN ('food', 'nhp', 'both'));

-- Index for domain-based filtering
CREATE INDEX IF NOT EXISTS idx_regulations_domain ON regulations(product_domain);
CREATE INDEX IF NOT EXISTS idx_sections_domain ON regulation_sections(product_domain);

-- Tag existing NHPR regulation as 'nhp'
UPDATE regulations SET product_domain = 'nhp' WHERE short_name = 'NHPR';

-- Tag Food and Drugs Act as 'both' (applies to both food and NHP)
UPDATE regulations SET product_domain = 'both' WHERE short_name IN ('FDA', 'FDR');

-- Tag CPLA/CPLR as 'both' (packaging applies to both)
UPDATE regulations SET product_domain = 'both' WHERE short_name IN ('CPLA', 'CPLR');

-- Tag CBSA/CTA as 'both' (import applies to both)
UPDATE regulations SET product_domain = 'both' WHERE short_name IN ('CTA');

-- Update match_regulation_chunks to support domain filtering
CREATE OR REPLACE FUNCTION match_regulation_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10,
  domain_filter TEXT DEFAULT NULL
)
RETURNS TABLE (
  section_id UUID,
  regulation_id UUID,
  regulation_name TEXT,
  regulation_short_name TEXT,
  section_number TEXT,
  title TEXT,
  content TEXT,
  official_url TEXT,
  section_url TEXT,
  topics TEXT[],
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    rs.id AS section_id,
    r.id AS regulation_id,
    r.title_en AS regulation_name,
    r.short_name AS regulation_short_name,
    rs.section_number,
    rs.title_en AS title,
    rs.content_en AS content,
    r.official_url,
    rs.section_url,
    rs.topics,
    1 - (rc.embedding <=> query_embedding) AS similarity
  FROM regulation_chunks rc
  JOIN regulation_sections rs ON rc.section_id = rs.id
  JOIN regulations r ON rs.regulation_id = r.id
  WHERE 1 - (rc.embedding <=> query_embedding) > match_threshold
    AND (domain_filter IS NULL
         OR r.product_domain = domain_filter
         OR r.product_domain = 'both')
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
