# Supabase Database Setup

This directory contains the database schema and migrations for Mirrorcle.

## Schema Overview

### Content Tables (read-only for users)
- **affirmations** - Affirmation messages with gradient colors
- **tags** - Categories for organizing affirmations (e.g., "self-worth", "growth")
- **affirmation_tags** - Many-to-many relationship between affirmations and tags
- **feelings** - Mood options users can select
- **feeling_tags** - Maps feelings to relevant tags with priority weights
- **quotes** - Inspirational quotes for different screens

### User Tables (user-owned data)
- **user_profiles** - Extended user data (stats, streaks, preferences)
- **user_notification_settings** - Notification preferences
- **user_favorites** - Saved affirmations
- **user_affirmation_history** - Tracks viewed/spoken affirmations
- **user_mood_history** - Mood entries over time
- **user_sessions** - Completed mirror sessions

## Running Migrations

### Option 1: Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:
   - `20240209000001_create_content_tables.sql`
   - `20240209000002_create_user_tables.sql`
   - `20240209000003_seed_initial_data.sql`

### Option 2: Supabase CLI
```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

## Data Flow

### Feeling-Based Affirmation Selection
```
User feels: "struggling"
     ↓
feeling_tags lookup: struggling → ["comfort", "validation", "resilience"]
     ↓
affirmation_tags lookup: find affirmations with those tags
     ↓
Filter: exclude already-engaged affirmations
     ↓
Filter: exclude premium if user is not Pro
     ↓
Display relevant, fresh affirmations
```

### Session Recording
```
User completes camera session
     ↓
Insert into user_sessions
     ↓
Insert into user_mood_history
     ↓
Insert into user_affirmation_history for each prompt
     ↓
Update user_profiles (stats, streak)
```

## Row Level Security

All user tables have RLS enabled:
- Users can only read/write their own data
- Content tables are readable by all authenticated users
- Only service role can modify content tables

## Adding New Content

To add new affirmations, tags, or feelings, use the Supabase Dashboard or run SQL as the service role:

```sql
-- Add a new tag
INSERT INTO tags (name, description)
VALUES ('confidence', 'Affirmations about self-confidence');

-- Add a new affirmation
INSERT INTO affirmations (text, gradient_start, gradient_end, is_prompt, is_premium)
VALUES ('I am confident in my abilities', '#3B82F6', '#06B6D4', false, false);

-- Link affirmation to tags
INSERT INTO affirmation_tags (affirmation_id, tag_id)
SELECT
  (SELECT id FROM affirmations WHERE text = 'I am confident in my abilities'),
  (SELECT id FROM tags WHERE name = 'confidence');
```
