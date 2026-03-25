-- Add public read policies for regulation data tables.
-- These tables contain public regulatory information that all users should access.

-- Enable RLS (idempotent — no error if already enabled)
ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulation_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE regulation_chunks ENABLE ROW LEVEL SECURITY;

-- Public read access for regulation data
CREATE POLICY "Anyone can read agencies"
  ON agencies FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read regulations"
  ON regulations FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read regulation sections"
  ON regulation_sections FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read regulation chunks"
  ON regulation_chunks FOR SELECT
  USING (true);
