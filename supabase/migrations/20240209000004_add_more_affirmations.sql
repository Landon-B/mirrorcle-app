-- Migration: Add 100 More Affirmations
-- Description: Expands the affirmation library with diverse, tagged affirmations

-- Tag reference:
-- 00000000-0000-0000-0000-000000000001 = self-worth
-- 00000000-0000-0000-0000-000000000002 = growth
-- 00000000-0000-0000-0000-000000000003 = gratitude
-- 00000000-0000-0000-0000-000000000004 = comfort
-- 00000000-0000-0000-0000-000000000005 = validation
-- 00000000-0000-0000-0000-000000000006 = resilience
-- 00000000-0000-0000-0000-000000000007 = joy
-- 00000000-0000-0000-0000-000000000008 = peace

-----------------------------------------------------------
-- SELF-WORTH AFFIRMATIONS (15)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0003-000000000001', 'I am valuable just as I am', '#A855F7', '#EC4899', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000002', 'My worth is not defined by others', '#8B5CF6', '#D946EF', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000003', 'I deserve to take up space', '#6366F1', '#A855F7', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000004', 'I am worthy of success and happiness', '#A855F7', '#F472B6', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000005', 'My voice matters and deserves to be heard', '#9333EA', '#EC4899', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000006', 'I accept myself unconditionally', '#7C3AED', '#DB2777', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000007', 'I am complete as I am right now', '#8B5CF6', '#F472B6', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000008', 'I honor my needs and boundaries', '#A855F7', '#EC4899', TRUE, FALSE),
  ('00000000-0000-0000-0003-000000000009', 'I am proud of who I am becoming', '#6366F1', '#D946EF', TRUE, FALSE),
  ('00000000-0000-0000-0003-000000000010', 'My imperfections make me unique', '#9333EA', '#F472B6', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000011', 'I treat myself with kindness and respect', '#8B5CF6', '#EC4899', FALSE, FALSE),
  ('00000000-0000-0000-0003-000000000012', 'I am allowed to put myself first', '#A855F7', '#DB2777', FALSE, TRUE),
  ('00000000-0000-0000-0003-000000000013', 'I celebrate my achievements, big and small', '#7C3AED', '#F472B6', FALSE, TRUE),
  ('00000000-0000-0000-0003-000000000014', 'I forgive myself for past mistakes', '#6366F1', '#EC4899', TRUE, FALSE),
  ('00000000-0000-0000-0003-000000000015', 'I am deserving of love exactly as I am', '#9333EA', '#D946EF', TRUE, FALSE);

-- Tag self-worth affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000001' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0003-%';

-----------------------------------------------------------
-- GROWTH AFFIRMATIONS (15)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0004-000000000001', 'Every challenge helps me grow', '#22C55E', '#10B981', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000002', 'I am constantly evolving and improving', '#14B8A6', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000003', 'I welcome new experiences with open arms', '#10B981', '#22D3EE', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000004', 'My potential is limitless', '#22C55E', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000005', 'I learn something valuable every day', '#059669', '#0891B2', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000006', 'Change is an opportunity for growth', '#10B981', '#14B8A6', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000007', 'I am becoming the best version of myself', '#22C55E', '#22D3EE', TRUE, FALSE),
  ('00000000-0000-0000-0004-000000000008', 'My mistakes are stepping stones to success', '#14B8A6', '#06B6D4', TRUE, FALSE),
  ('00000000-0000-0000-0004-000000000009', 'I embrace the journey of self-discovery', '#059669', '#10B981', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000010', 'I am open to learning and growing', '#22C55E', '#0891B2', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000011', 'Progress matters more than perfection', '#10B981', '#06B6D4', FALSE, TRUE),
  ('00000000-0000-0000-0004-000000000012', 'I trust the process of my development', '#14B8A6', '#22D3EE', FALSE, TRUE),
  ('00000000-0000-0000-0004-000000000013', 'Every day I become wiser and stronger', '#22C55E', '#14B8A6', TRUE, FALSE),
  ('00000000-0000-0000-0004-000000000014', 'I am patient with my personal growth', '#059669', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-0004-000000000015', 'My future is created by what I do today', '#10B981', '#0891B2', FALSE, FALSE);

-- Tag growth affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000002' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0004-%';

-----------------------------------------------------------
-- GRATITUDE AFFIRMATIONS (12)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0005-000000000001', 'I am thankful for this moment', '#FB7185', '#F43F5E', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000002', 'Gratitude fills my heart every day', '#F472B6', '#E11D48', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000003', 'I appreciate the abundance in my life', '#EC4899', '#F43F5E', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000004', 'I am grateful for my body and all it does', '#FB7185', '#DB2777', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000005', 'I find joy in the simple things', '#F472B6', '#F43F5E', TRUE, FALSE),
  ('00000000-0000-0000-0005-000000000006', 'I am blessed with wonderful people in my life', '#EC4899', '#E11D48', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000007', 'I choose to focus on what I have', '#FB7185', '#DB2777', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000008', 'Every breath is a gift I treasure', '#F472B6', '#F43F5E', TRUE, FALSE),
  ('00000000-0000-0000-0005-000000000009', 'I am grateful for my journey so far', '#EC4899', '#FB7185', FALSE, TRUE),
  ('00000000-0000-0000-0005-000000000010', 'Thankfulness opens doors to more blessings', '#FB7185', '#E11D48', FALSE, TRUE),
  ('00000000-0000-0000-0005-000000000011', 'I appreciate my unique gifts and talents', '#F472B6', '#DB2777', FALSE, FALSE),
  ('00000000-0000-0000-0005-000000000012', 'I wake up grateful for a new day', '#EC4899', '#F43F5E', TRUE, FALSE);

-- Tag gratitude affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000003' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0005-%';

-----------------------------------------------------------
-- COMFORT AFFIRMATIONS (12)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0006-000000000001', 'It is okay to not be okay right now', '#94A3B8', '#64748B', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000002', 'I give myself permission to rest', '#A1A1AA', '#71717A', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000003', 'This feeling is temporary and will pass', '#9CA3AF', '#6B7280', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000004', 'I am doing the best I can with what I have', '#94A3B8', '#71717A', TRUE, FALSE),
  ('00000000-0000-0000-0006-000000000005', 'I am allowed to ask for help', '#A1A1AA', '#64748B', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000006', 'I hold myself with compassion today', '#9CA3AF', '#78716C', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000007', 'I am safe in this present moment', '#94A3B8', '#6B7280', TRUE, FALSE),
  ('00000000-0000-0000-0006-000000000008', 'I embrace myself with gentle understanding', '#A1A1AA', '#71717A', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000009', 'Tomorrow is a fresh start waiting for me', '#9CA3AF', '#64748B', FALSE, TRUE),
  ('00000000-0000-0000-0006-000000000010', 'I release what I cannot control', '#94A3B8', '#78716C', TRUE, FALSE),
  ('00000000-0000-0000-0006-000000000011', 'I am gentle with myself during hard times', '#A1A1AA', '#6B7280', FALSE, FALSE),
  ('00000000-0000-0000-0006-000000000012', 'I trust that things will work out', '#9CA3AF', '#71717A', FALSE, FALSE);

-- Tag comfort affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000004' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0006-%';

-----------------------------------------------------------
-- VALIDATION AFFIRMATIONS (12)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0007-000000000001', 'My feelings are valid and important', '#A855F7', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000002', 'I have the right to feel what I feel', '#8B5CF6', '#4F46E5', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000003', 'My experiences have shaped me beautifully', '#9333EA', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000004', 'It makes sense that I feel this way', '#A855F7', '#4F46E5', TRUE, FALSE),
  ('00000000-0000-0000-0007-000000000005', 'I honor my emotions without judgment', '#8B5CF6', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000006', 'I am allowed to feel however I feel', '#9333EA', '#4F46E5', TRUE, FALSE),
  ('00000000-0000-0000-0007-000000000007', 'My perspective matters and is valuable', '#A855F7', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000008', 'I validate my own needs and desires', '#8B5CF6', '#4F46E5', FALSE, TRUE),
  ('00000000-0000-0000-0007-000000000009', 'My truth is worthy of being spoken', '#9333EA', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000010', 'I accept all parts of who I am', '#A855F7', '#4F46E5', TRUE, FALSE),
  ('00000000-0000-0000-0007-000000000011', 'My struggles do not diminish my worth', '#8B5CF6', '#6366F1', FALSE, FALSE),
  ('00000000-0000-0000-0007-000000000012', 'I acknowledge my progress and effort', '#9333EA', '#4F46E5', FALSE, FALSE);

-- Tag validation affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000005' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0007-%';

-----------------------------------------------------------
-- RESILIENCE AFFIRMATIONS (12)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0008-000000000001', 'I am stronger than my challenges', '#F97316', '#FACC15', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000002', 'I have overcome difficulties before', '#FB923C', '#FCD34D', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000003', 'I rise after every fall', '#F97316', '#FDE047', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000004', 'My spirit is unbreakable', '#EA580C', '#FACC15', TRUE, FALSE),
  ('00000000-0000-0000-0008-000000000005', 'I face obstacles with courage', '#FB923C', '#FCD34D', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000006', 'Setbacks are setups for comebacks', '#F97316', '#FDE047', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000007', 'I am built to handle hard things', '#EA580C', '#FACC15', TRUE, FALSE),
  ('00000000-0000-0000-0008-000000000008', 'I transform challenges into opportunities', '#FB923C', '#FCD34D', FALSE, TRUE),
  ('00000000-0000-0000-0008-000000000009', 'I persist when things get tough', '#F97316', '#FDE047', TRUE, FALSE),
  ('00000000-0000-0000-0008-000000000010', 'My resilience inspires others', '#EA580C', '#FACC15', FALSE, TRUE),
  ('00000000-0000-0000-0008-000000000011', 'I bounce back with even more strength', '#FB923C', '#FCD34D', FALSE, FALSE),
  ('00000000-0000-0000-0008-000000000012', 'Every setback is preparing me for success', '#F97316', '#FDE047', FALSE, FALSE);

-- Tag resilience affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000006' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0008-%';

-----------------------------------------------------------
-- JOY AFFIRMATIONS (12)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-0009-000000000001', 'I choose joy in every moment', '#FACC15', '#FB923C', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000002', 'Happiness flows through me naturally', '#FDE047', '#F97316', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000003', 'I radiate positive energy', '#FACC15', '#EA580C', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000004', 'My smile brightens the world', '#FCD34D', '#FB923C', TRUE, FALSE),
  ('00000000-0000-0000-0009-000000000005', 'I attract joy and abundance', '#FACC15', '#F97316', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000006', 'I celebrate life and all its beauty', '#FDE047', '#EA580C', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000007', 'Laughter comes easily to me', '#FACC15', '#FB923C', TRUE, FALSE),
  ('00000000-0000-0000-0009-000000000008', 'I find happiness in unexpected places', '#FCD34D', '#F97316', FALSE, TRUE),
  ('00000000-0000-0000-0009-000000000009', 'My heart is full of gratitude and joy', '#FACC15', '#EA580C', FALSE, FALSE),
  ('00000000-0000-0000-0009-000000000010', 'I am a magnet for wonderful experiences', '#FDE047', '#FB923C', FALSE, TRUE),
  ('00000000-0000-0000-0009-000000000011', 'Today I choose to be happy', '#FACC15', '#F97316', TRUE, FALSE),
  ('00000000-0000-0000-0009-000000000012', 'Joy is my natural state of being', '#FCD34D', '#EA580C', FALSE, FALSE);

-- Tag joy affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000007' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-0009-%';

-----------------------------------------------------------
-- PEACE AFFIRMATIONS (10)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  ('00000000-0000-0000-000A-000000000001', 'I am at peace with who I am', '#38BDF8', '#22D3EE', FALSE, FALSE),
  ('00000000-0000-0000-000A-000000000002', 'Calmness washes over me', '#0EA5E9', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-000A-000000000003', 'I release tension and embrace serenity', '#38BDF8', '#14B8A6', FALSE, FALSE),
  ('00000000-0000-0000-000A-000000000004', 'My mind is clear and focused', '#0EA5E9', '#22D3EE', TRUE, FALSE),
  ('00000000-0000-0000-000A-000000000005', 'I breathe in peace and exhale worry', '#38BDF8', '#06B6D4', TRUE, FALSE),
  ('00000000-0000-0000-000A-000000000006', 'Tranquility is my constant companion', '#0EA5E9', '#14B8A6', FALSE, FALSE),
  ('00000000-0000-0000-000A-000000000007', 'I find stillness within the chaos', '#38BDF8', '#22D3EE', FALSE, TRUE),
  ('00000000-0000-0000-000A-000000000008', 'Peace begins with me in this moment', '#0EA5E9', '#06B6D4', TRUE, FALSE),
  ('00000000-0000-0000-000A-000000000009', 'I am grounded and centered', '#38BDF8', '#14B8A6', FALSE, FALSE),
  ('00000000-0000-0000-000A-000000000010', 'Inner peace is always available to me', '#0EA5E9', '#22D3EE', FALSE, FALSE);

-- Tag peace affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT id, '00000000-0000-0000-0000-000000000008' FROM affirmations
WHERE id::text LIKE '00000000-0000-0000-000a-%';

-----------------------------------------------------------
-- CROSS-TAGGED AFFIRMATIONS (additional tags for richer matching)
-----------------------------------------------------------

-- Add validation tag to some comfort affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0006-000000000001', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0006-000000000004', '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-0006-000000000006', '00000000-0000-0000-0000-000000000005');

-- Add self-worth tag to some validation affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0000-000000000001'),
  ('00000000-0000-0000-0007-000000000007', '00000000-0000-0000-0000-000000000001');

-- Add growth tag to some resilience affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0008-000000000002', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0008-000000000006', '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-0008-000000000012', '00000000-0000-0000-0000-000000000002');

-- Add gratitude tag to some joy affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0009-000000000006', '00000000-0000-0000-0000-000000000003'),
  ('00000000-0000-0000-0009-000000000009', '00000000-0000-0000-0000-000000000003');

-- Add peace tag to some comfort affirmations
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0006-000000000007', '00000000-0000-0000-0000-000000000008'),
  ('00000000-0000-0000-0006-000000000010', '00000000-0000-0000-0000-000000000008');
