-- ============================================================
-- Migration: Mood Data Persistence
-- ============================================================
-- Fixes the silent data loss where post-session moods and
-- reflections were captured in the UI but never persisted.
-- Also adds mood intensity columns for richer trend analysis.
-- ============================================================

-- Add reflection_text to user_sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS reflection_text TEXT DEFAULT NULL;

-- Add mood intensity columns (1=mild, 2=moderate, 3=strong)
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS mood_intensity SMALLINT DEFAULT NULL;
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS post_mood_intensity SMALLINT DEFAULT NULL;

-- Add intensity to mood history for granular tracking
ALTER TABLE user_mood_history ADD COLUMN IF NOT EXISTS intensity SMALLINT DEFAULT NULL;

-- Add type column to mood history to distinguish pre vs post
ALTER TABLE user_mood_history ADD COLUMN IF NOT EXISTS mood_type TEXT DEFAULT 'pre'
  CHECK (mood_type IN ('pre', 'post'));
