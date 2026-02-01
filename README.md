# Mirrorcle

A self-affirmation app that helps you build a daily practice of positive self-reflection.

## Features

- **Mirror Sessions** - Look at yourself while speaking affirmations with front camera
- **Feelings Check-in** - Track your emotional state before each session
- **Favorites** - Save affirmations you connect with
- **Trends** - Visualize your practice over time
- **Themes** - Customize your experience with 6 color themes
- **Streaks** - Build consistency with daily streak tracking

## Getting Started

### Prerequisites

- Node.js 18+
- iOS device or Simulator
- [Expo Go](https://apps.apple.com/app/expo-go/id982107779) app (for testing on physical device)

### Installation

```bash
npm install
```

### Running on iPhone

**Option 1: Physical Device (Recommended)**

1. Install [Expo Go](https://apps.apple.com/app/expo-go/id982107779) on your iPhone
2. Start the dev server:
   ```bash
   npx expo start
   ```
3. Scan the QR code with your iPhone camera
4. The app will open in Expo Go

**Option 2: iOS Simulator**

```bash
npx expo start --ios
```

This will automatically launch the iOS Simulator and install Expo Go.

### Other Commands

```bash
# Start with tunnel (useful if device is on different network)
npx expo start --tunnel

# Clear cache and start fresh
npx expo start --clear

# Run on Android
npx expo start --android
```

## Project Structure

```
src/
├── components/     # Reusable UI components
├── screens/        # App screens
├── navigation/     # React Navigation setup
├── context/        # React Context providers
├── hooks/          # Custom hooks
├── services/       # Storage, notifications, audio
├── constants/      # App constants and config
├── utils/          # Helper functions
└── styles/         # Colors, spacing, typography
```

## Tech Stack

- React Native + Expo
- React Navigation
- AsyncStorage (Supabase-ready architecture)
- Expo Camera, Notifications, Speech
