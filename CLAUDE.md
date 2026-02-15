# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Start Expo dev server
npm start

# Run on specific platforms
npx expo start --ios          # iOS Simulator
npx expo start --android      # Android
npx expo start --web          # Web browser

# Useful variations
npx expo start --tunnel       # Cross-network testing (physical devices)
npx expo start --clear        # Clear cache and restart

# Supabase (local development)
npx supabase start            # Start local Supabase
npx supabase db push          # Apply migrations
npx supabase migration new <name>  # Create new migration
```

**Prerequisites:** Node.js 18+, Expo Go app for physical device testing

## Architecture Overview

This is a React Native/Expo managed app for guided self-affirmation mirror sessions.

### Tech Stack
- React Native 0.81.5 + Expo 54
- React Navigation 7 (native-stack)
- Supabase (auth, database, RLS) — primary data store for authenticated users
- AsyncStorage — fallback for unauthenticated users
- expo-camera, expo-speech, expo-notifications, expo-linear-gradient
- @react-native-voice/voice — speech recognition
- react-native-reanimated + react-native-gesture-handler — animations

### Data Flow Pattern
```
Context Providers → Custom Hooks → Services → Supabase / AsyncStorage
     ↓                  ↓
  Screens          Domain Logic
     ↓
  Components (theme-aware, gradient-based)
```

**Dual storage:** Authenticated users → Supabase via service singletons. Unauthenticated → AsyncStorage via `storageService`.

### Key Directories
- `src/context/` — AppContext (stats, sessions, preferences, unlockedThemes), ThemeContext
- `src/hooks/` — useStats, useFavorites, useNotifications, useAudio, useStorage, useSpeechRecognition, useSpeechMatcher, usePersonalization
- `src/services/` — Service singletons organized by domain:
  - `affirmations/` — AffirmationService (tag-weighted selection, personalized sessions)
  - `session/` — SessionService (sessions, mood history, streaks, affirmation engagement)
  - `user/` — UserProfileService (profile, favorites, notification settings)
  - `personalization/` — PersonalizationService (resonance, milestones, nudges, voice pacing), CustomAffirmationService
  - `notifications/` — NotificationService (expo-notifications with personalized templates)
  - `quotes/` — QuotesService
  - `auth/` — AuthService (Supabase auth, OTP)
  - `storage/` — StorageService adapter pattern (AsyncStorage)
  - `audio/` — AudioService (expo-speech stub)
  - `speech/` — SpeechRecognitionService (@react-native-voice/voice + Web Speech API)
- `src/constants/` — Affirmations, feelings, prompts, themes (with unlockRequirements), storage keys
- `src/components/` — common/ (GradientBackground, Card, PrimaryButton, GhostButton, OverlaySheet, IconButton), affirmation/, pro/ (FeatureGate), personalization/ (MilestoneCard, PowerPhraseCard, GrowthNudgeCard, MoodJourneyCard), stats/, onboarding/
- `src/utils/` — dateUtils, statsUtils, speech/SessionSpeechMatcher
- `src/styles/` — Design system (colors with 6 themes, typography, spacing)
- `supabase/migrations/` — 5 SQL migration files

### Navigation Flow
```
Welcome → CreateAccount / Login / ForgotPassword → Onboarding
  ↓
Home → AffirmationHome → Feelings → Session (CameraSession) → Reflection
                ↓
  Favorites, Trends, Themes, CustomAffirmations, NotificationSettings
  Paywall (modal for premium features)
```

### Service Architecture
All services are **singleton classes** exported from `src/services/index.js`. They use Supabase client from `src/config/supabase.js`. Services handle their own `supabase.auth.getUser()` checks.

### Database Schema (Supabase)

**Content tables** (readable by all authenticated users):
- `affirmations` — text, gradients, is_prompt, is_premium
- `tags` — name, description, time_affinity (morning/evening/null)
- `affirmation_tags` — junction (affirmation_id, tag_id)
- `feelings` — id (TEXT PK), label, icon, gradients, sort_order
- `feeling_tags` — junction with weight column (higher = more relevant)
- `quotes` — text, author, screen, is_premium

**User tables** (RLS — users see only own data):
- `user_profiles` — id→auth.users, name, is_pro, theme_id, streaks, totals, preferred_session_length, experience_level, avg_speech_speed_wpm
- `user_sessions` — feeling_id, duration_seconds, prompts_completed, time_of_day
- `user_affirmation_history` — affirmation_id, engaged (bool), session_id, completion_time_seconds
- `user_mood_history` — feeling_id, session_id
- `user_favorites` — affirmation_id (UNIQUE with user_id)
- `user_notification_settings` — enabled, time, timezone
- `user_custom_affirmations` — text, is_active
- `user_milestones` — milestone_key, achieved_at, dismissed (UNIQUE user_id+key)

**Triggers:** `handle_new_user()` auto-creates profile + notification settings on signup. `update_updated_at_column()` for timestamps.

### Personalization System
- **Smart selection:** `AffirmationService.getPersonalizedForSession()` — tag weights + resonance scores + difficulty filtering + time-of-day boost + custom affirmations merged in, weighted random sampling
- **Session length:** User-selectable (3/5/7) via FeelingsScreen pills, stored in preferences
- **Voice pacing:** Exponential moving average of speech WPM per user
- **Milestones:** 9 types (first_session, ten_sessions, fifty_sessions, hundred_affirmations, seven_day_streak, thirty_day_streak, first_favorite, all_feelings_explored, custom_affirmation_created)
- **Theme unlocks:** Premium themes earnable via milestones (7-day streak → Sunset Glow, 30-day → Rose Garden, 100 sessions → Midnight Blue)
- **Growth nudges:** Feeling diversity, new feeling celebration, streak recovery, consistency acknowledgment
- **Power phrase:** Most-spoken affirmation highlighted in Reflection

### Theme System
Six themes (3 free, 3 premium) in `src/constants/themes.js`. Premium themes have `unlockRequirement` for milestone-based unlocking. `unlockedThemes` array tracked in AppContext. ThemeContext provides `theme` and `changeTheme`.

### Premium Features
`isPro` flag in user_profiles/preferences. `FeatureGate` component + `useFeatureGate` hook. PaywallScreen for upsell. Custom affirmations: 3 free, unlimited Pro.

### Speech Recognition Flow
1. `useSpeechRecognition` wraps platform-specific recognition (Voice for native, Web Speech API for web)
2. `useSpeechMatcher` feeds speech into `SessionSpeechMatcher` — fuzzy word matching with Levenshtein distance
3. `AffirmationHighlightText` renders token-by-token: green (spoken) → purple (current) → gray (pending)

## Storage Keys
All AsyncStorage keys prefixed with `mirrorcle-`: feeling, stats, preferences, favorites, sessions, theme, onboarding, notifications.

## Stats & Streaks
- Streak calculation in `SessionService.updateStreak()` — based on unique session dates
- Current streak: consecutive days from today/yesterday backward
- Stats: totalSessions, totalTimeSeconds, totalAffirmations, currentStreak, longestStreak, feelingsHistory
- `dateUtils.js` — formatTime, getToday, isToday, isYesterday, getDaysBetween
