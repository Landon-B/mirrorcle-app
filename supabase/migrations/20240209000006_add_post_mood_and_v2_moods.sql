-- Add post-session mood tracking to sessions
ALTER TABLE user_sessions ADD COLUMN IF NOT EXISTS post_mood_id TEXT DEFAULT NULL;

-- Add emoji column to feelings table
ALTER TABLE feelings ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT NULL;

-- Insert v2 moods (or update existing ones with emoji)
INSERT INTO feelings (id, label, icon, gradient_start, gradient_end, emoji, sort_order) VALUES
  ('calm', 'Calm', 'emoticon-happy', '#E8D0C6', '#C17666', '😌', 10),
  ('anxious', 'Anxious', 'alert-circle', '#E8D0C6', '#C17666', '😟', 11),
  ('confident', 'Confident', 'star', '#E8D0C6', '#C17666', '✨', 12),
  ('sad', 'Sad', 'emoticon-sad', '#E8D0C6', '#C17666', '😔', 13),
  ('energized', 'Energized', 'flash', '#E8D0C6', '#C17666', '⚡', 14),
  ('overwhelmed', 'Overwhelmed', 'alert', '#E8D0C6', '#C17666', '🤯', 15)
ON CONFLICT (id) DO UPDATE SET
  emoji = EXCLUDED.emoji,
  sort_order = EXCLUDED.sort_order;

-- Update existing v1 feelings with emoji equivalents
UPDATE feelings SET emoji = '⚡' WHERE id = 'amazing' AND emoji IS NULL;
UPDATE feelings SET emoji = '😊' WHERE id = 'happy' AND emoji IS NULL;
UPDATE feelings SET emoji = '🙏' WHERE id = 'grateful' AND emoji IS NULL;
UPDATE feelings SET emoji = '😐' WHERE id = 'okay' AND emoji IS NULL;
UPDATE feelings SET emoji = '😞' WHERE id = 'low' AND emoji IS NULL;
UPDATE feelings SET emoji = '😰' WHERE id = 'struggling' AND emoji IS NULL;
