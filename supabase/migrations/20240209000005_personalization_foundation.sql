-- Migration: Personalization Foundation
-- Description: Adds personalization columns, custom affirmations, and milestones tables

-----------------------------------------------------------
-- ALTER EXISTING TABLES
-----------------------------------------------------------

-- Add personalization columns to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN preferred_session_length INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN experience_level INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN avg_speech_speed_wpm REAL DEFAULT NULL;

-- Add completion time tracking to affirmation history
ALTER TABLE user_affirmation_history
  ADD COLUMN completion_time_seconds REAL DEFAULT NULL;

-- Add time of day to sessions
ALTER TABLE user_sessions
  ADD COLUMN time_of_day TEXT DEFAULT NULL;

-- Add time affinity to tags
ALTER TABLE tags
  ADD COLUMN time_affinity TEXT DEFAULT NULL;

-----------------------------------------------------------
-- USER_CUSTOM_AFFIRMATIONS TABLE
-----------------------------------------------------------
CREATE TABLE user_custom_affirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_user_custom_affirmations_user_id ON user_custom_affirmations(user_id);

COMMENT ON TABLE user_custom_affirmations IS 'User-created custom affirmations for personalized sessions';

-----------------------------------------------------------
-- USER_MILESTONES TABLE
-----------------------------------------------------------
CREATE TABLE user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  milestone_key TEXT NOT NULL,
  achieved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  dismissed BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (user_id, milestone_key)
);

CREATE INDEX idx_user_milestones_user_id ON user_milestones(user_id);

COMMENT ON TABLE user_milestones IS 'Tracks user achievement milestones for personalization';

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-----------------------------------------------------------

ALTER TABLE user_custom_affirmations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_milestones ENABLE ROW LEVEL SECURITY;

-- Custom affirmations policies
CREATE POLICY "Users can view own custom affirmations"
  ON user_custom_affirmations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom affirmations"
  ON user_custom_affirmations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom affirmations"
  ON user_custom_affirmations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom affirmations"
  ON user_custom_affirmations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Milestones policies
CREATE POLICY "Users can view own milestones"
  ON user_milestones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones"
  ON user_milestones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones"
  ON user_milestones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-----------------------------------------------------------
-- SEED: Set time_affinity on existing tags
-----------------------------------------------------------

UPDATE tags SET time_affinity = 'morning' WHERE name IN ('energy', 'motivation', 'confidence');
UPDATE tags SET time_affinity = 'evening' WHERE name IN ('reflection', 'gratitude', 'peace');
-- self-worth, growth, etc. remain NULL (no time affinity)
