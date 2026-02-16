-- Migration: Focus Areas + V2 Mood Tags
-- Description: Adds daily focus tracking to user_profiles, focus_area_id to sessions,
-- and seeds feeling_tags for v2 moods (calm, anxious, confident, sad, energized, overwhelmed)

-----------------------------------------------------------
-- ADD DAILY FOCUS COLUMNS TO USER_PROFILES
-----------------------------------------------------------
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS daily_focus_id TEXT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS daily_focus_date DATE DEFAULT NULL;

-----------------------------------------------------------
-- ADD FOCUS_AREA_ID TO USER_SESSIONS
-----------------------------------------------------------
ALTER TABLE user_sessions
  ADD COLUMN IF NOT EXISTS focus_area_id TEXT DEFAULT NULL;

-----------------------------------------------------------
-- SEED V2 MOOD → TAG MAPPINGS
-- Weights are intentionally low (1-2) since mood is the
-- secondary signal. Focus area tags use weight 5 in the
-- application layer scoring.
-----------------------------------------------------------

-- calm → peace (2), comfort (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('calm', '00000000-0000-0000-0000-000000000008', 2),
  ('calm', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- anxious → comfort (2), validation (2), peace (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('anxious', '00000000-0000-0000-0000-000000000004', 2),
  ('anxious', '00000000-0000-0000-0000-000000000005', 2),
  ('anxious', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- confident → resilience (2), self-worth (2), joy (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('confident', '00000000-0000-0000-0000-000000000006', 2),
  ('confident', '00000000-0000-0000-0000-000000000001', 2),
  ('confident', '00000000-0000-0000-0000-000000000007', 1)
ON CONFLICT DO NOTHING;

-- sad → comfort (2), validation (2), self-worth (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('sad', '00000000-0000-0000-0000-000000000004', 2),
  ('sad', '00000000-0000-0000-0000-000000000005', 2),
  ('sad', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- energized → joy (2), growth (2), resilience (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('energized', '00000000-0000-0000-0000-000000000007', 2),
  ('energized', '00000000-0000-0000-0000-000000000002', 2),
  ('energized', '00000000-0000-0000-0000-000000000006', 1)
ON CONFLICT DO NOTHING;

-- overwhelmed → comfort (2), peace (2), validation (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('overwhelmed', '00000000-0000-0000-0000-000000000004', 2),
  ('overwhelmed', '00000000-0000-0000-0000-000000000008', 2),
  ('overwhelmed', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;
