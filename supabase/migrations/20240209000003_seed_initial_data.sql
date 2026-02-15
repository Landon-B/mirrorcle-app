-- Migration: Seed Initial Data
-- Description: Populates affirmations, tags, feelings, and their relationships

-----------------------------------------------------------
-- SEED TAGS
-----------------------------------------------------------
INSERT INTO tags (id, name, description) VALUES
  ('00000000-0000-0000-0000-000000000001', 'self-worth', 'Affirmations about being enough and worthy'),
  ('00000000-0000-0000-0000-000000000002', 'growth', 'Affirmations about personal development and change'),
  ('00000000-0000-0000-0000-000000000003', 'gratitude', 'Affirmations about appreciation and thankfulness'),
  ('00000000-0000-0000-0000-000000000004', 'comfort', 'Supportive messages for difficult times'),
  ('00000000-0000-0000-0000-000000000005', 'validation', 'Affirmations that validate feelings and experiences'),
  ('00000000-0000-0000-0000-000000000006', 'resilience', 'Affirmations about strength and perseverance'),
  ('00000000-0000-0000-0000-000000000007', 'joy', 'Celebratory and uplifting affirmations'),
  ('00000000-0000-0000-0000-000000000008', 'peace', 'Calming and grounding affirmations');

-----------------------------------------------------------
-- SEED FEELINGS
-----------------------------------------------------------
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, sort_order) VALUES
  ('amazing', 'Amazing', 'flash', '#FACC15', '#FB923C', 1),
  ('happy', 'Happy', 'emoticon-happy', '#4ADE80', '#34D399', 2),
  ('grateful', 'Grateful', 'heart', '#FB7185', '#F43F5E', 3),
  ('okay', 'Okay', 'emoticon-neutral', '#38BDF8', '#22D3EE', 4),
  ('low', 'Low', 'weather-cloudy', '#94A3B8', '#64748B', 5),
  ('struggling', 'Struggling', 'emoticon-sad', '#A855F7', '#6366F1', 6);

-----------------------------------------------------------
-- SEED FEELING-TAG MAPPINGS
-----------------------------------------------------------
-- Amazing: joy (high), gratitude (high), growth (medium)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('amazing', '00000000-0000-0000-0000-000000000007', 3),  -- joy
  ('amazing', '00000000-0000-0000-0000-000000000003', 3),  -- gratitude
  ('amazing', '00000000-0000-0000-0000-000000000002', 2);  -- growth

-- Happy: joy (high), gratitude (medium)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('happy', '00000000-0000-0000-0000-000000000007', 3),    -- joy
  ('happy', '00000000-0000-0000-0000-000000000003', 2);    -- gratitude

-- Grateful: gratitude (high), peace (medium)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('grateful', '00000000-0000-0000-0000-000000000003', 3), -- gratitude
  ('grateful', '00000000-0000-0000-0000-000000000008', 2); -- peace

-- Okay: peace (high), growth (medium)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('okay', '00000000-0000-0000-0000-000000000008', 3),     -- peace
  ('okay', '00000000-0000-0000-0000-000000000002', 2);     -- growth

-- Low: comfort (high), validation (high), self-worth (medium)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('low', '00000000-0000-0000-0000-000000000004', 3),      -- comfort
  ('low', '00000000-0000-0000-0000-000000000005', 3),      -- validation
  ('low', '00000000-0000-0000-0000-000000000001', 2);      -- self-worth

-- Struggling: comfort (high), validation (high), resilience (high)
INSERT INTO feeling_tags (feeling_id, tag_id, weight) VALUES
  ('struggling', '00000000-0000-0000-0000-000000000004', 3),  -- comfort
  ('struggling', '00000000-0000-0000-0000-000000000005', 3),  -- validation
  ('struggling', '00000000-0000-0000-0000-000000000006', 3);  -- resilience

-----------------------------------------------------------
-- SEED AFFIRMATIONS (from existing affirmations.js)
-----------------------------------------------------------
INSERT INTO affirmations (id, text, gradient_start, gradient_end, is_prompt, is_premium) VALUES
  -- Original affirmations (display cards)
  ('00000000-0000-0000-0001-000000000001', 'I am worthy of love and respect', '#A855F7', '#EC4899', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000002', 'I am capable of achieving my dreams', '#3B82F6', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000003', 'I embrace my unique journey', '#22C55E', '#10B981', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000004', 'I am growing stronger every day', '#F97316', '#FACC15', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000005', 'I choose to see the good in myself', '#F43F5E', '#EC4899', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000006', 'I am deserving of all good things', '#6366F1', '#A855F7', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000007', 'I trust my path and my timing', '#14B8A6', '#06B6D4', FALSE, FALSE),
  ('00000000-0000-0000-0001-000000000008', 'I am enough exactly as I am', '#8B5CF6', '#D946EF', FALSE, FALSE),

  -- Original prompts (spoken in camera sessions)
  ('00000000-0000-0000-0002-000000000001', 'I am enough', '#A855F7', '#EC4899', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000002', 'I am worthy of love', '#F43F5E', '#EC4899', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000003', 'I believe in myself', '#3B82F6', '#06B6D4', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000004', 'I am strong and capable', '#22C55E', '#10B981', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000005', 'I choose happiness', '#FACC15', '#FB923C', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000006', 'I am grateful for today', '#FB7185', '#F43F5E', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000007', 'I embrace my journey', '#14B8A6', '#06B6D4', TRUE, FALSE),
  ('00000000-0000-0000-0002-000000000008', 'I am growing every day', '#F97316', '#FACC15', TRUE, FALSE);

-----------------------------------------------------------
-- SEED AFFIRMATION-TAG MAPPINGS
-----------------------------------------------------------
-- Affirmation: "I am worthy of love and respect" -> self-worth, validation
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0001-000000000001', '00000000-0000-0000-0000-000000000005');  -- validation

-- Affirmation: "I am capable of achieving my dreams" -> growth, resilience
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000002'),  -- growth
  ('00000000-0000-0000-0001-000000000002', '00000000-0000-0000-0000-000000000006');  -- resilience

-- Affirmation: "I embrace my unique journey" -> growth, peace
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000002'),  -- growth
  ('00000000-0000-0000-0001-000000000003', '00000000-0000-0000-0000-000000000008');  -- peace

-- Affirmation: "I am growing stronger every day" -> growth, resilience
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000002'),  -- growth
  ('00000000-0000-0000-0001-000000000004', '00000000-0000-0000-0000-000000000006');  -- resilience

-- Affirmation: "I choose to see the good in myself" -> self-worth, joy
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0001-000000000005', '00000000-0000-0000-0000-000000000007');  -- joy

-- Affirmation: "I am deserving of all good things" -> self-worth, gratitude
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0001-000000000006', '00000000-0000-0000-0000-000000000003');  -- gratitude

-- Affirmation: "I trust my path and my timing" -> peace, growth
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000008'),  -- peace
  ('00000000-0000-0000-0001-000000000007', '00000000-0000-0000-0000-000000000002');  -- growth

-- Affirmation: "I am enough exactly as I am" -> self-worth, validation, comfort
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000005'),  -- validation
  ('00000000-0000-0000-0001-000000000008', '00000000-0000-0000-0000-000000000004');  -- comfort

-- Prompt: "I am enough" -> self-worth, validation
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0000-000000000005');  -- validation

-- Prompt: "I am worthy of love" -> self-worth, validation
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0000-000000000005');  -- validation

-- Prompt: "I believe in myself" -> self-worth, resilience
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000001'),  -- self-worth
  ('00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0000-000000000006');  -- resilience

-- Prompt: "I am strong and capable" -> resilience, self-worth
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000006'),  -- resilience
  ('00000000-0000-0000-0002-000000000004', '00000000-0000-0000-0000-000000000001');  -- self-worth

-- Prompt: "I choose happiness" -> joy, peace
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000007'),  -- joy
  ('00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0000-000000000008');  -- peace

-- Prompt: "I am grateful for today" -> gratitude
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0000-000000000003');  -- gratitude

-- Prompt: "I embrace my journey" -> growth, peace
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000002'),  -- growth
  ('00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0000-000000000008');  -- peace

-- Prompt: "I am growing every day" -> growth
INSERT INTO affirmation_tags (affirmation_id, tag_id) VALUES
  ('00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0000-000000000002');  -- growth

-----------------------------------------------------------
-- SEED SAMPLE QUOTES
-----------------------------------------------------------
INSERT INTO quotes (text, author, screen, is_premium) VALUES
  ('The only person you are destined to become is the person you decide to be.', 'Ralph Waldo Emerson', NULL, FALSE),
  ('You yourself, as much as anybody in the entire universe, deserve your love and affection.', 'Buddha', NULL, FALSE),
  ('What lies behind us and what lies before us are tiny matters compared to what lies within us.', 'Ralph Waldo Emerson', NULL, FALSE),
  ('Believe you can and you''re halfway there.', 'Theodore Roosevelt', 'login', FALSE),
  ('The journey of a thousand miles begins with a single step.', 'Lao Tzu', 'create_account', FALSE),
  ('Every day is a new beginning. Take a deep breath and start again.', NULL, 'home', FALSE),
  ('Be gentle with yourself. You are doing the best you can.', NULL, 'reflection', FALSE),
  ('You are braver than you believe, stronger than you seem, and smarter than you think.', 'A.A. Milne', NULL, FALSE);
