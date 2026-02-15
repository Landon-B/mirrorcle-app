-- Migration: Create User Tables
-- Description: Creates user profile, settings, favorites, history, and session tables

-----------------------------------------------------------
-- USER_PROFILES TABLE
-----------------------------------------------------------
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  is_pro BOOLEAN NOT NULL DEFAULT FALSE,
  theme_id TEXT DEFAULT 'sunrise',
  last_login TIMESTAMPTZ DEFAULT NOW(),
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  total_time_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for finding active users
CREATE INDEX idx_user_profiles_last_login ON user_profiles(last_login);

COMMENT ON TABLE user_profiles IS 'Extended user profile data linked to auth.users';
COMMENT ON COLUMN user_profiles.current_streak IS 'Consecutive days the user has completed a session';
COMMENT ON COLUMN user_profiles.longest_streak IS 'Best streak achieved by this user';

-----------------------------------------------------------
-- USER_NOTIFICATION_SETTINGS TABLE
-----------------------------------------------------------
CREATE TABLE user_notification_settings (
  user_id UUID PRIMARY KEY REFERENCES user_profiles(id) ON DELETE CASCADE,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  time TIME DEFAULT '09:00:00',
  timezone TEXT DEFAULT 'America/New_York',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE user_notification_settings IS 'User preferences for daily reminder notifications';

-----------------------------------------------------------
-- USER_SESSIONS TABLE
-----------------------------------------------------------
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  feeling_id TEXT REFERENCES feelings(id),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  prompts_completed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user's session history
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_created_at ON user_sessions(created_at);
-- Composite index for user session lookups by date
CREATE INDEX idx_user_sessions_user_date ON user_sessions(user_id, created_at);

COMMENT ON TABLE user_sessions IS 'Records of completed mirror sessions';

-----------------------------------------------------------
-- USER_FAVORITES TABLE
-----------------------------------------------------------
CREATE TABLE user_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  affirmation_id UUID NOT NULL REFERENCES affirmations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, affirmation_id)
);

-- Index for user's favorites
CREATE INDEX idx_user_favorites_user_id ON user_favorites(user_id);

COMMENT ON TABLE user_favorites IS 'Affirmations saved by users to their favorites';

-----------------------------------------------------------
-- USER_AFFIRMATION_HISTORY TABLE
-----------------------------------------------------------
CREATE TABLE user_affirmation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  affirmation_id UUID NOT NULL REFERENCES affirmations(id) ON DELETE CASCADE,
  engaged BOOLEAN NOT NULL DEFAULT FALSE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user's affirmation history
CREATE INDEX idx_user_affirmation_history_user_id ON user_affirmation_history(user_id);
-- Index for finding engaged affirmations
CREATE INDEX idx_user_affirmation_history_user_engaged ON user_affirmation_history(user_id, engaged);
-- Index for session lookups
CREATE INDEX idx_user_affirmation_history_session_id ON user_affirmation_history(session_id);

COMMENT ON TABLE user_affirmation_history IS 'Tracks which affirmations users have seen and spoken';
COMMENT ON COLUMN user_affirmation_history.engaged IS 'True if the user spoke this affirmation aloud';

-----------------------------------------------------------
-- USER_MOOD_HISTORY TABLE
-----------------------------------------------------------
CREATE TABLE user_mood_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  feeling_id TEXT NOT NULL REFERENCES feelings(id) ON DELETE CASCADE,
  session_id UUID REFERENCES user_sessions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user's mood history
CREATE INDEX idx_user_mood_history_user_id ON user_mood_history(user_id);
-- Index for mood trends by date
CREATE INDEX idx_user_mood_history_user_date ON user_mood_history(user_id, created_at);
-- Index for session lookups
CREATE INDEX idx_user_mood_history_session_id ON user_mood_history(session_id);

COMMENT ON TABLE user_mood_history IS 'Tracks user moods over time for trends analysis';

-----------------------------------------------------------
-- ROW LEVEL SECURITY
-----------------------------------------------------------

-- Enable RLS on all user tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_affirmation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_mood_history ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- USER_NOTIFICATION_SETTINGS policies
CREATE POLICY "Users can view own notification settings"
  ON user_notification_settings FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification settings"
  ON user_notification_settings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification settings"
  ON user_notification_settings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- USER_SESSIONS policies
CREATE POLICY "Users can view own sessions"
  ON user_sessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sessions"
  ON user_sessions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- USER_FAVORITES policies
CREATE POLICY "Users can view own favorites"
  ON user_favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON user_favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON user_favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- USER_AFFIRMATION_HISTORY policies
CREATE POLICY "Users can view own affirmation history"
  ON user_affirmation_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own affirmation history"
  ON user_affirmation_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- USER_MOOD_HISTORY policies
CREATE POLICY "Users can view own mood history"
  ON user_mood_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood history"
  ON user_mood_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-----------------------------------------------------------
-- FUNCTIONS & TRIGGERS
-----------------------------------------------------------

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for user_notification_settings
CREATE TRIGGER update_user_notification_settings_updated_at
  BEFORE UPDATE ON user_notification_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile on auth.users insert
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'name');

  INSERT INTO public.user_notification_settings (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
