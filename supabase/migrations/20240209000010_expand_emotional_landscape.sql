-- Migration: Expand Emotional Landscape
-- Description: Adds 6 new feelings (grateful, content, lonely, vulnerable,
-- hopeful, frustrated) to support the two-layer mood family system.
-- Existing 6 moods (calm, anxious, confident, sad, energized, overwhelmed)
-- are unchanged. New feelings are mapped to existing tags with appropriate weights.

-----------------------------------------------------------
-- INSERT NEW FEELINGS
-- sort_order continues from 15 (overwhelmed)
-----------------------------------------------------------

INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, emoji, sort_order) VALUES
  ('grateful',    'Grateful',    'heart',        '#E8D0C6', '#C17666', '🙏', 16),
  ('content',     'Content',     'cafe',         '#E8D0C6', '#C17666', '☕', 17),
  ('lonely',      'Lonely',      'water',        '#E8D0C6', '#C17666', '🫧', 18),
  ('vulnerable',  'Vulnerable',  'butterfly',    '#E8D0C6', '#C17666', '🦋', 19),
  ('hopeful',     'Hopeful',     'star',         '#E8D0C6', '#C17666', '🌟', 20),
  ('frustrated',  'Frustrated',  'alert-circle', '#E8D0C6', '#C17666', '😤', 21)
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order;

-----------------------------------------------------------
-- SEED FEELING_TAGS FOR NEW MOODS
-- Tag UUIDs (from migration 0003):
--   0001 = self-worth    0005 = validation
--   0002 = growth        0006 = resilience
--   0003 = gratitude     0007 = joy
--   0004 = comfort       0008 = peace
--
-- Weights 1-2 (mood is secondary signal; focus area = 5)
-----------------------------------------------------------

-- grateful → gratitude (2), joy (2), peace (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('grateful', '00000000-0000-0000-0000-000000000003', 2),
  ('grateful', '00000000-0000-0000-0000-000000000007', 2),
  ('grateful', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- content → peace (2), comfort (2), gratitude (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('content', '00000000-0000-0000-0000-000000000008', 2),
  ('content', '00000000-0000-0000-0000-000000000004', 2),
  ('content', '00000000-0000-0000-0000-000000000003', 1)
ON CONFLICT DO NOTHING;

-- lonely → comfort (2), validation (2), self-worth (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('lonely', '00000000-0000-0000-0000-000000000004', 2),
  ('lonely', '00000000-0000-0000-0000-000000000005', 2),
  ('lonely', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- vulnerable → validation (2), self-worth (2), comfort (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('vulnerable', '00000000-0000-0000-0000-000000000005', 2),
  ('vulnerable', '00000000-0000-0000-0000-000000000001', 2),
  ('vulnerable', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- hopeful → growth (2), joy (2), resilience (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('hopeful', '00000000-0000-0000-0000-000000000002', 2),
  ('hopeful', '00000000-0000-0000-0000-000000000007', 2),
  ('hopeful', '00000000-0000-0000-0000-000000000006', 1)
ON CONFLICT DO NOTHING;

-- frustrated → resilience (2), validation (2), peace (1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('frustrated', '00000000-0000-0000-0000-000000000006', 2),
  ('frustrated', '00000000-0000-0000-0000-000000000005', 2),
  ('frustrated', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;
