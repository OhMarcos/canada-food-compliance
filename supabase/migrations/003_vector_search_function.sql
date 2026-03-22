-- RPC function for vector similarity search
-- Used by the RAG retriever for semantic search
CREATE OR REPLACE FUNCTION match_regulation_chunks(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.5,
  match_count INT DEFAULT 10
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
  ORDER BY rc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
