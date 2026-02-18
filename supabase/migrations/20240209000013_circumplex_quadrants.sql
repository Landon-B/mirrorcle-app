-- ============================================================
-- Migration: Circumplex Quadrant Model
-- ============================================================
-- Restructures the emotional landscape from 5 families to 4 quadrants
-- based on the Russell Circumplex Model of Affect:
--   Bright  = High Energy + Pleasant   (amber/gold)
--   Charged = High Energy + Unpleasant (coral/terracotta)
--   Tender  = Low Energy  + Pleasant   (sage/green)
--   Deep    = Low Energy  + Unpleasant (blue/lavender)
--
-- Adds ~20 new feelings across the 4 quadrants, with feeling_tags
-- and quadrant/bubble_size/definition metadata.
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
-- 1. Add new columns to feelings table
-- ============================================================

ALTER TABLE feelings ADD COLUMN IF NOT EXISTS quadrant TEXT
  CHECK (quadrant IN ('bright', 'charged', 'tender', 'deep'));

ALTER TABLE feelings ADD COLUMN IF NOT EXISTS bubble_size TEXT DEFAULT 'medium'
  CHECK (bubble_size IN ('large', 'medium', 'small'));

ALTER TABLE feelings ADD COLUMN IF NOT EXISTS definition TEXT;

-- ============================================================
-- 2. Update existing feelings with quadrant assignments
-- ============================================================

-- Bright (was Electric + grateful moves here)
UPDATE feelings SET quadrant = 'bright', bubble_size = 'large'  WHERE id = 'energized';
UPDATE feelings SET quadrant = 'bright', bubble_size = 'large'  WHERE id = 'confident';
UPDATE feelings SET quadrant = 'bright', bubble_size = 'medium' WHERE id = 'hopeful';
UPDATE feelings SET quadrant = 'bright', bubble_size = 'medium' WHERE id = 'grateful';

-- Charged (was Heavy)
UPDATE feelings SET quadrant = 'charged', bubble_size = 'large'  WHERE id = 'anxious';
UPDATE feelings SET quadrant = 'charged', bubble_size = 'large'  WHERE id = 'overwhelmed';
UPDATE feelings SET quadrant = 'charged', bubble_size = 'medium' WHERE id = 'frustrated';
UPDATE feelings SET quadrant = 'charged', bubble_size = 'small'  WHERE id = 'ashamed';

-- Tender (was Peaceful, minus grateful)
UPDATE feelings SET quadrant = 'tender', bubble_size = 'large'  WHERE id = 'calm';
UPDATE feelings SET quadrant = 'tender', bubble_size = 'large'  WHERE id = 'content';

-- Deep (was Still + Tender's sad/lonely/vulnerable)
UPDATE feelings SET quadrant = 'deep', bubble_size = 'large'  WHERE id = 'sad';
UPDATE feelings SET quadrant = 'deep', bubble_size = 'medium' WHERE id = 'lonely';
UPDATE feelings SET quadrant = 'deep', bubble_size = 'medium' WHERE id = 'vulnerable';
UPDATE feelings SET quadrant = 'deep', bubble_size = 'medium' WHERE id = 'numb';
UPDATE feelings SET quadrant = 'deep', bubble_size = 'medium' WHERE id = 'disconnected';
UPDATE feelings SET quadrant = 'deep', bubble_size = 'medium' WHERE id = 'drained';

-- Add definitions to existing moods
UPDATE feelings SET definition = 'Fired up, alive, ready to move'          WHERE id = 'energized';
UPDATE feelings SET definition = 'Standing tall, trusting yourself'         WHERE id = 'confident';
UPDATE feelings SET definition = 'Sensing that something good is coming'    WHERE id = 'hopeful';
UPDATE feelings SET definition = 'Heart-full, thankful for what you have'   WHERE id = 'grateful';
UPDATE feelings SET definition = 'Racing thoughts, tightness in your body'  WHERE id = 'anxious';
UPDATE feelings SET definition = 'Too much at once, hard to hold it all'    WHERE id = 'overwhelmed';
UPDATE feelings SET definition = 'Blocked, stuck, unable to move forward'   WHERE id = 'frustrated';
UPDATE feelings SET definition = 'Shrinking, judging yourself harshly'      WHERE id = 'ashamed';
UPDATE feelings SET definition = 'At ease, settled, nothing pulling at you' WHERE id = 'calm';
UPDATE feelings SET definition = 'Enough, just as it is'                    WHERE id = 'content';
UPDATE feelings SET definition = 'Heavy-hearted, something aches inside'    WHERE id = 'sad';
UPDATE feelings SET definition = 'Isolated, missing connection with others' WHERE id = 'lonely';
UPDATE feelings SET definition = 'Exposed, open, without armor'             WHERE id = 'vulnerable';
UPDATE feelings SET definition = 'Flat, feeling nothing at all'             WHERE id = 'numb';
UPDATE feelings SET definition = 'Far away, going through the motions'      WHERE id = 'disconnected';
UPDATE feelings SET definition = 'Used up, running on empty'                WHERE id = 'drained';
UPDATE feelings SET definition = 'Hard to name right now'                   WHERE id = 'unsure';

-- ============================================================
-- 3. Insert new feelings
-- ============================================================

-- Bright quadrant: excited, inspired, proud, joyful, amused
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji, quadrant, bubble_size, definition)
VALUES
  ('excited',  'Excited',  'flash',       '#E8B878', '#D4A060', 30, '', 'bright', 'medium', 'Buzzing with anticipation and energy'),
  ('inspired', 'Inspired', 'bulb',        '#CDA068', '#B88850', 31, '', 'bright', 'small',  'Moved to create, to act, to dream'),
  ('proud',    'Proud',    'trophy',      '#D09458', '#B87D42', 32, '', 'bright', 'small',  'Recognizing your own worth and effort'),
  ('joyful',   'Joyful',   'sunny',       '#E5B06A', '#D09850', 33, '', 'bright', 'medium', 'Light, open, genuinely happy'),
  ('amused',   'Amused',   'happy',       '#DBAA72', '#C89458', 34, '', 'bright', 'small',  'Finding humor and lightness in things')
ON CONFLICT (id) DO UPDATE SET
  quadrant = EXCLUDED.quadrant,
  bubble_size = EXCLUDED.bubble_size,
  definition = EXCLUDED.definition;

-- Charged quadrant: angry, restless, irritable, panicked, jealous
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji, quadrant, bubble_size, definition)
VALUES
  ('angry',     'Angry',     'flame',       '#B85A50', '#A04840', 35, '', 'charged', 'medium', 'Bothered deeply, fire in your chest'),
  ('restless',  'Restless',  'swap-horizontal', '#CA7868', '#B86858', 36, '', 'charged', 'medium', 'Unable to settle, something pulling at you'),
  ('irritable', 'Irritable', 'thunderstorm', '#D48878', '#C07060', 37, '', 'charged', 'small',  'On edge, small things feel too much'),
  ('panicked',  'Panicked',  'alert-circle', '#BE6658', '#A85448', 38, '', 'charged', 'small',  'Gripped by sudden fear or urgency'),
  ('jealous',   'Jealous',   'eye',          '#C87470', '#B46060', 39, '', 'charged', 'small',  'Wanting what someone else has')
ON CONFLICT (id) DO UPDATE SET
  quadrant = EXCLUDED.quadrant,
  bubble_size = EXCLUDED.bubble_size,
  definition = EXCLUDED.definition;

-- Tender quadrant: relaxed, serene, peaceful, gentle, cozy, reassured, thoughtful
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji, quadrant, bubble_size, definition)
VALUES
  ('relaxed',    'Relaxed',    'leaf',       '#A0B898', '#8AA880', 40, '', 'tender', 'medium', 'Loose, unhurried, body at rest'),
  ('serene',     'Serene',     'water',      '#88A480', '#709468', 41, '', 'tender', 'small',  'Deeply peaceful, undisturbed'),
  ('peaceful',   'Peaceful',   'flower',     '#92AE88', '#7A9A70', 42, '', 'tender', 'medium', 'Harmonious, at one with the moment'),
  ('gentle',     'Gentle',     'feather',    '#9CB894', '#84A87C', 43, '', 'tender', 'small',  'Soft, treating yourself with care'),
  ('cozy',       'Cozy',       'home',       '#A4BC9C', '#8CAC84', 44, '', 'tender', 'small',  'Warm, safe, wrapped in comfort'),
  ('reassured',  'Reassured',  'shield-checkmark', '#8CA884', '#74986C', 45, '', 'tender', 'small', 'Soothed, reminded that it will be okay'),
  ('thoughtful', 'Thoughtful', 'book',       '#98B290', '#80A278', 46, '', 'tender', 'medium', 'Reflective, turning something over quietly')
ON CONFLICT (id) DO UPDATE SET
  quadrant = EXCLUDED.quadrant,
  bubble_size = EXCLUDED.bubble_size,
  definition = EXCLUDED.definition;

-- Deep quadrant: melancholy, exhausted, forlorn, defeated
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order, emoji, quadrant, bubble_size, definition)
VALUES
  ('melancholy', 'Melancholy', 'rainy',      '#8C94B4', '#74849C', 47, '', 'deep', 'small', 'A quiet, lingering sadness'),
  ('exhausted',  'Exhausted',  'bed',         '#848CA4', '#6C7C94', 48, '', 'deep', 'small', 'Beyond tired, nothing left to give'),
  ('forlorn',    'Forlorn',    'cloudy-night', '#8088A8', '#687890', 49, '', 'deep', 'small', 'Feeling both sad and alone'),
  ('defeated',   'Defeated',   'trending-down', '#7C84A0', '#647488', 50, '', 'deep', 'small', 'Like you tried and it was not enough')
ON CONFLICT (id) DO UPDATE SET
  quadrant = EXCLUDED.quadrant,
  bubble_size = EXCLUDED.bubble_size,
  definition = EXCLUDED.definition;

-- ============================================================
-- 4. Feeling → Tag mappings for new feelings
-- ============================================================

-- excited → joy(2), growth(2), resilience(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('excited', '00000000-0000-0000-0000-000000000007', 2),
  ('excited', '00000000-0000-0000-0000-000000000002', 2),
  ('excited', '00000000-0000-0000-0000-000000000006', 1)
ON CONFLICT DO NOTHING;

-- inspired → growth(2), joy(2), self-worth(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('inspired', '00000000-0000-0000-0000-000000000002', 2),
  ('inspired', '00000000-0000-0000-0000-000000000007', 2),
  ('inspired', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- proud → self-worth(2), resilience(2), joy(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('proud', '00000000-0000-0000-0000-000000000001', 2),
  ('proud', '00000000-0000-0000-0000-000000000006', 2),
  ('proud', '00000000-0000-0000-0000-000000000007', 1)
ON CONFLICT DO NOTHING;

-- joyful → joy(2), gratitude(2), peace(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('joyful', '00000000-0000-0000-0000-000000000007', 2),
  ('joyful', '00000000-0000-0000-0000-000000000003', 2),
  ('joyful', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- amused → joy(2), peace(1), comfort(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('amused', '00000000-0000-0000-0000-000000000007', 2),
  ('amused', '00000000-0000-0000-0000-000000000008', 1),
  ('amused', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- angry → resilience(2), validation(2), self-worth(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('angry', '00000000-0000-0000-0000-000000000006', 2),
  ('angry', '00000000-0000-0000-0000-000000000005', 2),
  ('angry', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- restless → peace(2), comfort(2), validation(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('restless', '00000000-0000-0000-0000-000000000008', 2),
  ('restless', '00000000-0000-0000-0000-000000000004', 2),
  ('restless', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;

-- irritable → peace(2), validation(2), comfort(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('irritable', '00000000-0000-0000-0000-000000000008', 2),
  ('irritable', '00000000-0000-0000-0000-000000000005', 2),
  ('irritable', '00000000-0000-0000-0000-000000000004', 1)
ON CONFLICT DO NOTHING;

-- panicked → comfort(2), peace(2), validation(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('panicked', '00000000-0000-0000-0000-000000000004', 2),
  ('panicked', '00000000-0000-0000-0000-000000000008', 2),
  ('panicked', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;

-- jealous → self-worth(2), growth(2), validation(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('jealous', '00000000-0000-0000-0000-000000000001', 2),
  ('jealous', '00000000-0000-0000-0000-000000000002', 2),
  ('jealous', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;

-- relaxed → peace(2), comfort(2), gratitude(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('relaxed', '00000000-0000-0000-0000-000000000008', 2),
  ('relaxed', '00000000-0000-0000-0000-000000000004', 2),
  ('relaxed', '00000000-0000-0000-0000-000000000003', 1)
ON CONFLICT DO NOTHING;

-- serene → peace(2), comfort(1), gratitude(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('serene', '00000000-0000-0000-0000-000000000008', 2),
  ('serene', '00000000-0000-0000-0000-000000000004', 1),
  ('serene', '00000000-0000-0000-0000-000000000003', 1)
ON CONFLICT DO NOTHING;

-- peaceful → peace(2), comfort(2), gratitude(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('peaceful', '00000000-0000-0000-0000-000000000008', 2),
  ('peaceful', '00000000-0000-0000-0000-000000000004', 2),
  ('peaceful', '00000000-0000-0000-0000-000000000003', 1)
ON CONFLICT DO NOTHING;

-- gentle → comfort(2), self-worth(2), peace(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('gentle', '00000000-0000-0000-0000-000000000004', 2),
  ('gentle', '00000000-0000-0000-0000-000000000001', 2),
  ('gentle', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- cozy → comfort(2), peace(2), gratitude(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('cozy', '00000000-0000-0000-0000-000000000004', 2),
  ('cozy', '00000000-0000-0000-0000-000000000008', 2),
  ('cozy', '00000000-0000-0000-0000-000000000003', 1)
ON CONFLICT DO NOTHING;

-- reassured → validation(2), comfort(2), peace(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('reassured', '00000000-0000-0000-0000-000000000005', 2),
  ('reassured', '00000000-0000-0000-0000-000000000004', 2),
  ('reassured', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- thoughtful → growth(2), peace(2), self-worth(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('thoughtful', '00000000-0000-0000-0000-000000000002', 2),
  ('thoughtful', '00000000-0000-0000-0000-000000000008', 2),
  ('thoughtful', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- melancholy → comfort(2), validation(2), peace(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('melancholy', '00000000-0000-0000-0000-000000000004', 2),
  ('melancholy', '00000000-0000-0000-0000-000000000005', 2),
  ('melancholy', '00000000-0000-0000-0000-000000000008', 1)
ON CONFLICT DO NOTHING;

-- exhausted → comfort(2), peace(2), resilience(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('exhausted', '00000000-0000-0000-0000-000000000004', 2),
  ('exhausted', '00000000-0000-0000-0000-000000000008', 2),
  ('exhausted', '00000000-0000-0000-0000-000000000006', 1)
ON CONFLICT DO NOTHING;

-- forlorn → comfort(2), validation(2), self-worth(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('forlorn', '00000000-0000-0000-0000-000000000004', 2),
  ('forlorn', '00000000-0000-0000-0000-000000000005', 2),
  ('forlorn', '00000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- defeated → resilience(2), self-worth(2), validation(1)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('defeated', '00000000-0000-0000-0000-000000000006', 2),
  ('defeated', '00000000-0000-0000-0000-000000000001', 2),
  ('defeated', '00000000-0000-0000-0000-000000000005', 1)
ON CONFLICT DO NOTHING;
