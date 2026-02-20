-- ============================================================
-- Migration: Smart Check-In System
-- ============================================================
-- Supports strategic mood data collection:
--   1. Standalone check-ins (not tied to sessions)
--   2. Evening reflections (adaptive, unlocked after streak)
--   3. Quick quadrant-only captures for repeat sessions
--   4. Check-in streak tracking for habit reinforcement
-- ============================================================

-- Widen mood_type constraint to support new check-in types
-- Drop old constraint and add new one
ALTER TABLE user_mood_history DROP CONSTRAINT IF EXISTS user_mood_history_mood_type_check;
ALTER TABLE user_mood_history ADD CONSTRAINT user_mood_history_mood_type_check
  CHECK (mood_type IN ('pre', 'post', 'checkin', 'evening'));

-- Add quadrant_id for quick check-ins that only capture quadrant level
ALTER TABLE user_mood_history ADD COLUMN IF NOT EXISTS quadrant_id TEXT DEFAULT NULL;

-- Add check-in tracking columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_full_checkin_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS checkin_streak INT DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS longest_checkin_streak INT DEFAULT 0;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS last_checkin_date DATE DEFAULT NULL;

-- Index for efficient check-in queries (mood_type + user_id + date)
CREATE INDEX IF NOT EXISTS idx_mood_history_checkin_lookup
  ON user_mood_history (user_id, mood_type, created_at DESC);
