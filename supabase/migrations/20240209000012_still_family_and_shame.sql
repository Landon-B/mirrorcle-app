-- ============================================================
-- Migration: Still Family + Ashamed Mood + Emoji Updates
-- ============================================================
-- Expands the emotional landscape with:
--   - "Still" family: numb, disconnected, drained
--   - "Ashamed" added to Heavy family
--   - "Unsure" special mood for unnameable states
--   - Emoji updates for existing moods (audit)
-- ============================================================

-- Tag UUIDs (from migration 0003)
-- self-worth:  00000000-0000-0000-0000-000000000001
-- growth:      00000000-0000-0000-0000-000000000002
-- gratitude:   00000000-0000-0000-0000-000000000003
-- comfort:     00000000-0000-0000-0000-000000000004
-- validation:  00000000-0000-0000-0000-000000000005
-- resilience:  00000000-0000-0000-0000-000000000006
-- joy:         00000000-0000-0000-0000-000000000007
-- peace:       00000000-0000-0000-0000-000000000008

-- ============================================================
-- 1. Insert new feelings
-- ============================================================

-- Still family
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji)
VALUES
  ('numb',         'Numb',         'cloud',           '#94A3B8', '#64748B', 22, '😶‍🌫️'),
  ('disconnected', 'Disconnected', 'link-off',        '#78716C', '#57534E', 23, '🫥'),
  ('drained',      'Drained',      'battery-outline', '#D4956E', '#B8805A', 24, '🕯️')
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order;

-- Heavy family addition
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji)
VALUES
  ('ashamed', 'Ashamed', 'eye-off', '#E879A0', '#D45D85', 25, '🫠')
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order;

-- Special: unsure mood
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji)
VALUES
  ('unsure', 'Something unnamed', 'help-circle', '#B0AAA2', '#94908A', 26, '🤍')
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order;

-- ============================================================
-- 2. Feeling → Tag mappings for new moods
-- ============================================================

-- numb → comfort(2), peace(2), validation(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('numb', '00000000-0000-0000-0000-000000000004', 2),
  ('numb', '00000000-0000-0000-0000-000000000008', 2),
  ('numb', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;

-- disconnected → validation(2), self-worth(2), comfort(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('disconnected', '00000000-0000-0000-0000-000000000005', 2),
  ('disconnected', '00000000-0000-0000-0000-000000000001', 2),
  ('disconnected', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- drained → comfort(2), peace(2), resilience(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('drained', '00000000-0000-0000-0000-000000000004', 2),
  ('drained', '00000000-0000-0000-0000-000000000008', 2),
  ('drained', '00000000-0000-0000-0000-000000000006', 1)
ON CONFLICT DO NOTHING;

-- ashamed → self-worth(2), validation(2), comfort(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('ashamed', '00000000-0000-0000-0000-000000000001', 2),
  ('ashamed', '00000000-0000-0000-0000-000000000005', 2),
  ('ashamed', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- unsure → comfort(1), peace(1) (neutral, gentle)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('unsure', '00000000-0000-0000-0000-000000000004', 1),
  ('unsure', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- ============================================================
-- 3. Update existing mood emojis (emoji audit)
-- ============================================================

UPDATE feelings SET emoji = '🫖'    WHERE id = 'content';
UPDATE feelings SET emoji = '🥀'    WHERE id = 'sad';
UPDATE feelings SET emoji = '🪐'    WHERE id = 'lonely';
UPDATE feelings SET emoji = '🔥'    WHERE id = 'energized';
UPDATE feelings SET emoji = '👑'    WHERE id = 'confident';
UPDATE feelings SET emoji = '🌅'    WHERE id = 'hopeful';
UPDATE feelings SET emoji = '🫨'    WHERE id = 'anxious';
UPDATE feelings SET emoji = '😮‍💨' WHERE id = 'overwhelmed';
