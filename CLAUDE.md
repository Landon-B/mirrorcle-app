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
```

**Prerequisites:** Node.js 18+, Expo Go app for physical device testing

## Architecture Overview

This is a React Native/Expo managed app for guided self-affirmation mirror sessions.

### Tech Stack
- React Native 0.81.5 + Expo 54
- React Navigation 7 (native-stack)
- AsyncStorage for persistence (abstracted for future Supabase migration)
- expo-camera, expo-speech, expo-notifications, expo-linear-gradient

### Data Flow Pattern
```
Context Providers → Custom Hooks → Services → AsyncStorage
     ↓                  ↓
  Screens          Domain Logic
     ↓
  Components (theme-aware, gradient-based)
```

### Key Directories
- `src/context/` - AppContext (stats, sessions, preferences), ThemeContext
- `src/hooks/` - useStats, useFavorites, useNotifications, useAudio, useStorage
- `src/services/` - StorageService adapter pattern, AudioService, NotificationService
- `src/constants/` - Affirmations data, feelings, themes, storage keys
- `src/styles/` - Design system (colors with 6 themes, typography, spacing)

### Navigation Flow
```
Onboarding → Home → Feelings → CameraSession → Reflection
               ↓
         AffirmationHome, Favorites, Trends, Themes, NotificationSettings
         Paywall (modal for premium features)
```

### Service Architecture
The storage layer uses an adapter pattern (`StorageService` base class with `AsyncStorageAdapter`). Services are singletons exported from their modules. NotificationService and AudioService are stubs with implementation comments ready for real expo-notifications/expo-speech integration.

### Theme System
Six themes (3 free, 3 premium) defined in `src/constants/themes.js`. All UI uses `GradientBackground` and theme-aware buttons. Theme changes propagate via ThemeContext.

### Premium Features
`isPro` flag in preferences, `FeatureGate` component wraps premium-only content, PaywallScreen handles upsell.

## Storage Keys
All keys prefixed with `mirrorcle-`: feeling, stats, preferences, favorites, sessions, theme, onboarding, notifications.

## Stats & Streaks
- `statsUtils.js` handles streak calculation (consecutive days logic)
- `dateUtils.js` provides date formatting and comparison utilities
- Stats tracked: totalSessions, totalTime, favoriteAffirmations, completedPrompts, feelings history
