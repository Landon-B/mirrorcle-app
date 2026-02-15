-- Migration: Create Content Tables
-- Description: Creates affirmations, tags, feelings, and quotes tables

-----------------------------------------------------------
-- AFFIRMATIONS TABLE
-----------------------------------------------------------
CREATE TABLE affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  gradient_start TEXT NOT NULL DEFAULT '#A855F7',
  gradient_end TEXT NOT NULL DEFAULT '#EC4899',
  is_prompt BOOLEAN NOT NULL DEFAULT FALSE,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for filtering by prompt/premium status
CREATE INDEX idx_affirmations_is_prompt ON affirmations(is_prompt);
CREATE INDEX idx_affirmations_is_premium ON affirmations(is_premium);

COMMENT ON TABLE affirmations IS 'Stores all affirmation messages used in the app';
COMMENT ON COLUMN affirmations.is_prompt IS 'True if this affirmation is used as a spoken prompt in camera sessions';
COMMENT ON COLUMN affirmations.is_premium IS 'True if this affirmation is only available to Pro users';

-----------------------------------------------------------
-- TAGS TABLE
-----------------------------------------------------------
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE tags IS 'Categories for organizing affirmations (e.g., self-worth, growth, comfort)';

-----------------------------------------------------------
-- AFFIRMATION_TAGS JUNCTION TABLE
-----------------------------------------------------------
CREATE TABLE affirmation_tags (
  affirmation_id UUID NOT NULL REFERENCES affirmations(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (affirmation_id, tag_id)
);

-- Index for looking up affirmations by tag
CREATE INDEX idx_affirmation_tags_tag_id ON affirmation_tags(tag_id);

COMMENT ON TABLE affirmation_tags IS 'Many-to-many relationship between affirmations and tags';

-----------------------------------------------------------
-- FEELINGS TABLE
-----------------------------------------------------------
CREATE TABLE feelings (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  icon TEXT NOT NULL,
  gradient_start TEXT NOT NULL,
  gradient_end TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- Index for ordering
CREATE INDEX idx_feelings_sort_order ON feelings(sort_order);

COMMENT ON TABLE feelings IS 'Mood/feeling options users can select at the start of a session';

-----------------------------------------------------------
-- FEELING_TAGS JUNCTION TABLE
-----------------------------------------------------------
CREATE TABLE feeling_tags (
  feeling_id TEXT NOT NULL REFERENCES feelings(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  weight INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (feeling_id, tag_id)
);

-- Index for looking up tags by feeling
CREATE INDEX idx_feeling_tags_feeling_id ON feeling_tags(feeling_id);
-- Index for looking up feelings by tag
CREATE INDEX idx_feeling_tags_tag_id ON feeling_tags(tag_id);

COMMENT ON TABLE feeling_tags IS 'Maps feelings to relevant affirmation tags with priority weights';
COMMENT ON COLUMN feeling_tags.weight IS 'Higher weight = more relevant tags for this feeling';

-----------------------------------------------------------
-- QUOTES TABLE
-----------------------------------------------------------
CREATE TABLE quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  author TEXT,
  screen TEXT,
  is_premium BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for filtering by screen
CREATE INDEX idx_quotes_screen ON quotes(screen);
CREATE INDEX idx_quotes_is_premium ON quotes(is_premium);

COMMENT ON TABLE quotes IS 'Inspirational quotes displayed throughout the app';
COMMENT ON COLUMN quotes.screen IS 'Specific screen to show this quote (null = any screen)';

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-----------------------------------------------------------

-- Enable RLS on all content tables
ALTER TABLE affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE affirmation_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE feelings ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeling_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotes ENABLE ROW LEVEL SECURITY;

-- Content tables are readable by all authenticated users
CREATE POLICY "Affirmations are viewable by authenticated users"
  ON affirmations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Tags are viewable by authenticated users"
  ON tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Affirmation tags are viewable by authenticated users"
  ON affirmation_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Feelings are viewable by authenticated users"
  ON feelings FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Feeling tags are viewable by authenticated users"
  ON feeling_tags FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Quotes are viewable by authenticated users"
  ON quotes FOR SELECT
  TO authenticated
  USING (true);

-- Only service role can modify content tables (no INSERT/UPDATE/DELETE policies for regular users)
