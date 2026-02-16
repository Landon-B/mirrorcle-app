-- Add trial tracking columns to user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS trial_ended_at TIMESTAMPTZ DEFAULT NULL;
