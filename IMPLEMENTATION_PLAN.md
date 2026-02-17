# Dark Mode: "Evening Glow" — Implementation Plan

## The Vision

Mirrorcle's light theme feels like morning sunlight streaming through linen curtains — warm, gentle, inviting. Dark mode shouldn't be its opposite. It should feel like **the evening version of the same warmth**: candlelight on dark wood, embers in a fireplace, the golden hour just before sleep. We're calling it **"Evening Glow."**

This isn't a cold, techy dark mode. It's a *sanctuary at night* — the same self-compassion, wrapped in deeper tones. The terracotta accent stays, but softens into a warm amber that glows against the dark. Text becomes warm cream instead of harsh white. The entire experience should feel like the app is whispering instead of speaking.

---

## Design Philosophy

### What dark mode means for a self-affirmation app

Most dark modes are built for productivity apps — high contrast, sharp edges, pure blacks. That's wrong for Mirrorcle. When someone opens this app at 11pm, anxious and looking inward, they need:

1. **No retinal shock** — soft dark backgrounds, not `#000000`
2. **Warmth preserved** — the terracotta soul of the app shouldn't vanish
3. **Intimacy amplified** — dark mode should feel *more* personal, not less
4. **Legibility without strain** — warm off-white text, generous contrast ratios

### The palette

| Token | Light (Warm Light) | Dark (Evening Glow) | Intent |
|-------|-------------------|---------------------|--------|
| `background` | `#F5F2EE` cream | `#1C1917` warm charcoal | Main canvas |
| `backgroundElevated` | — | `#231F1C` slightly lifted | Scroll containers, modals |
| `surface` | `#FFFFFF` white | `#292524` warm stone | Cards |
| `surfaceSecondary` | `#F9F7F5` | `#1F1B18` | Subtle containers |
| `surfaceTertiary` | `#F0ECE7` | `#352F2B` | Back buttons, chips |
| `textPrimary` | `#2D2A26` near-black | `#F5F2EE` warm cream | Body text |
| `textSecondary` | `#7A756E` warm gray | `#A8A29E` stone | Secondary text |
| `textMuted` | `#B0AAA2` | `#78716C` | Hints, placeholders |
| `textAccent` | `#C17666` terracotta | `#D4956E` warm amber | Accent text |
| `border` | `#E8E4DF` | `#3D3835` | Card borders |
| `borderSolid` | `#DDD8D2` | `#44403C` | Heavier borders |
| `accent` | `#C17666` terracotta | `#D4956E` warm amber | Primary accent |
| `accentLight` | `#E8D0C6` peach | `#44302A` deep rust tint | Accent backgrounds |
| `accentPeach` | `#E8D0C6` | `#3D2D27` | Mood accent areas |
| `cardShadow` | `rgba(0,0,0,0.06)` | `rgba(0,0,0,0.3)` | Depth |
| `overlay` | `rgba(0,0,0,0.3)` | `rgba(0,0,0,0.5)` | Modal overlays |
| `disabled` | `#D4CFC9` | `#44403C` | Inactive states |
| `inputBackground` | `#FFFFFF` | `#292524` | Form fields |
| `selectedMoodBg` | `#EDE4DC` | `#3D2D27` | Selected mood chip |
| `success` | `#22C55E` | `#4ADE80` | Slightly brighter in dark |
| `warning` | `#F59E0B` | `#FBBF24` | Slightly brighter in dark |
| `error` | `#EF4444` | `#F87171` | Slightly brighter in dark |

### Gradient adjustments

| Gradient | Light | Dark |
|----------|-------|------|
| `primary` (buttons) | `['#C17666', '#E8A090']` | `['#C17666', '#D4956E']` — same terracotta, warmer end |
| `background` | `['#F9F7F5', '#F5F2EE']` | `['#231F1C', '#1C1917']` — subtle warm gradient |
| `intentionCard` | `['#C17666', '#D4956E']` | `['#8B4F42', '#A66B4F']` — deeper, richer |

### StatusBar

| Context | Light | Dark |
|---------|-------|------|
| All screens (except camera) | `dark-content` | `light-content` |
| CameraSessionScreen | `light-content` | `light-content` (no change) |

---

## Architecture Plan

### The core problem

Today, ~32 screen files and ~10 component files hardcode colors like `'#F5F2EE'` and `'#FFFFFF'` directly. The design token file (`src/styles/colors.js`) exists but is barely consumed. ThemeContext exists but only PrimaryButton uses it.

We need to make the app **theme-aware** without rewriting every screen from scratch.

### Strategy: Token-first, screen-by-screen

#### Phase 0: Foundation (the infrastructure)

**0a. Expand the color token system**

Transform `src/styles/colors.js` from a flat export into a **light/dark palette provider**:

```js
// src/styles/colors.js

const lightPalette = {
  background: '#F5F2EE',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F7F5',
  surfaceTertiary: '#F0ECE7',
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  textAccent: '#C17666',
  textOnPrimary: '#FFFFFF',
  border: '#E8E4DF',
  borderSolid: '#DDD8D2',
  accent: '#C17666',
  accentLight: '#E8D0C6',
  accentPeach: '#E8D0C6',
  // ... all current tokens
};

const darkPalette = {
  background: '#1C1917',
  surface: '#292524',
  surfaceSecondary: '#1F1B18',
  surfaceTertiary: '#352F2B',
  textPrimary: '#F5F2EE',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',
  textAccent: '#D4956E',
  textOnPrimary: '#FFFFFF',
  border: '#3D3835',
  borderSolid: '#44403C',
  accent: '#D4956E',
  accentLight: '#44302A',
  accentPeach: '#3D2D27',
  // ... all dark equivalents
};

// Keep backward compat: `colors` still works as before
export const colors = lightPalette;
export { lightPalette, darkPalette };
```

**0b. Create a `useColors()` hook**

```js
// src/hooks/useColors.js
import { useTheme } from '../context/ThemeContext';
import { lightPalette, darkPalette } from '../styles/colors';

export function useColors() {
  const { colorScheme } = useTheme();
  return colorScheme === 'dark' ? darkPalette : lightPalette;
}
```

This is the **key unlock**. Every screen gets colors via `const c = useColors()` instead of hardcoded hex. Simple, greppable, incrementally adoptable.

**0c. Upgrade ThemeContext**

Add `colorScheme` state (`'light' | 'dark' | 'system'`) to ThemeContext:

```js
// ThemeContext additions:
// - colorScheme: 'light' | 'dark' | 'system'
// - resolvedScheme: 'light' | 'dark' (after system resolution)
// - toggleColorScheme(): cycles light → dark → system
// - Listens to RN Appearance API for system preference
// - Persists choice to AsyncStorage
```

**0d. Add "Evening Glow" theme to themes.js**

```js
eveningGlow: {
  id: 'evening-glow',
  name: 'Evening Glow',
  isPremium: false,  // dark mode is a basic accessibility feature
  background: '#1C1917',
  cardBg: '#292524',
  accent: '#D4956E',
  accentLight: '#44302A',
  buttonGradient: ['#C17666', '#D4956E'],
  sessionGradient: ['#C17666', '#D4956E'],
  gradient: ['#231F1C', '#1C1917'],
  primary: ['#C17666', '#D4956E'],
}
```

#### Phase 1: Common components (biggest leverage)

Update all 9 common components to be theme-aware. This cascades to every screen that uses them:

| Component | Changes |
|-----------|---------|
| `Card.js` | `backgroundColor` from `useColors().surface` |
| `PrimaryButton.js` | Already theme-aware — just verify dark gradient |
| `GhostButton.js` | Border + text color from tokens |
| `IconButton.js` | Bg colors from tokens |
| `ScreenHeader.js` | Back button bg + icon color from tokens |
| `OverlaySheet.js` | Handle + surface color from tokens |
| `FloatingParticles.js` | Particle color adjustments |
| `GradientBackground.js` | Background gradient from tokens |
| `ErrorBoundary.js` | Background + text from tokens |

**Estimated: 9 files, ~2-4 line changes each**

#### Phase 2: Screen migration (screen by screen)

Each screen follows the same pattern:

**Before:**
```js
const CREAM = '#F5F2EE';
const RUST = '#C17666';
// ...
const styles = StyleSheet.create({
  container: { backgroundColor: '#F5F2EE' },
});
```

**After:**
```js
import { useColors } from '../hooks/useColors';

// Inside component:
const c = useColors();

// In JSX:
<View style={[styles.container, { backgroundColor: c.background }]}>
<StatusBar barStyle={c.statusBarStyle} />
<Text style={[styles.text, { color: c.textPrimary }]}>
```

**Migration order** (by user visibility / impact):

| Priority | Screens | Rationale |
|----------|---------|-----------|
| P0 | HomeScreen, AffirmationHomeScreen | First thing users see |
| P0 | CameraSessionScreen | Already dark — minimal changes needed |
| P1 | MoodCheckInScreen, FocusSelectionScreen, BreathingPrepScreen | Session flow — must be cohesive |
| P1 | PostMoodReflectionScreen, SuccessCelebrationScreen | Session end flow |
| P2 | ProfileScreen, FavoritesScreen, GrowthDashboardScreen | Secondary screens |
| P2 | MoodAnalyticsScreen, ReflectionSummaryScreen, JourneyTimelineScreen, ActivityCalendarScreen | Growth screens |
| P3 | ThemesScreen, CustomAffirmationsScreen, NotificationSettingsScreen | Settings |
| P3 | PaywallScreen, PrivacyScreen, LegalAgreementScreen | Utility |
| P4 | WelcomeScreen, OnboardingScreen, CreateAccountScreen, LoginScreen, ForgotPasswordScreen | Auth flow |
| P4 | SaveJourneyScreen, GuidedFirstSessionScreen, GuidedFirstCelebrationScreen, PowerOfReflectionScreen, MilestoneCelebrationScreen, SplashScreen | Onboarding / celebration |

**Estimated: 33 screens, ~10-20 line changes each**

#### Phase 3: Specialized components

| Directory | Components | Notes |
|-----------|-----------|-------|
| `src/components/affirmation/` | AffirmationHighlightText, etc. | Token colors for spoken/pending/current states |
| `src/components/personalization/` | MoodPatternChart, MilestoneProgressCard, etc. | Chart colors, bar fills |
| `src/components/stats/` | Any stat visualization | |
| `src/components/pro/` | FeatureGate, PaywallModal | Modal surfaces |
| `src/components/onboarding/` | Onboarding slides | |

#### Phase 4: Widget sync

- Update `WidgetDataService` to pass color scheme to widget
- Update `AffirmationWidget.js` (SwiftUI) to respect dark mode
- iOS widgets can use `@Environment(\.colorScheme)` natively

#### Phase 5: UI for switching

**Option A: System-follows (recommended default)**

- Default to system preference via `Appearance.getColorScheme()`
- Add toggle in ProfileScreen settings: "Appearance: Light / Dark / System"
- Small, clean segmented control — not a full screen

**Option B: In ThemesScreen**

- Add Evening Glow as a theme card alongside Warm Light
- Theme selection = color scheme selection

Recommendation: **Both.** Quick toggle in Profile for convenience. ThemesScreen for the full visual preview. The toggle controls `colorScheme`, ThemesScreen controls `themeId`, and they're linked (selecting Evening Glow sets dark scheme, selecting Warm Light sets light scheme).

---

## What NOT to change

- **CameraSessionScreen's dark overlay** — it's already dark for camera purposes, leave it as-is with minor adjustments
- **Affirmation text colors during sessions** — these are designed for readability against the camera view
- **Haptic patterns** — no change needed
- **Navigation structure** — dark mode is purely visual
- **Database schema** — `colorScheme` preference stored via existing AsyncStorage/preferences path

---

## Effort Estimate

| Phase | Files | Complexity | Dependency |
|-------|-------|------------|------------|
| Phase 0: Foundation | 4 files | Medium | None |
| Phase 1: Common components | 9 files | Low | Phase 0 |
| Phase 2: Screen migration | 33 files | Low (repetitive) | Phase 1 |
| Phase 3: Specialized components | ~10 files | Medium | Phase 1 |
| Phase 4: Widget | 2 files | Medium | Phase 0 |
| Phase 5: UI toggle | 2-3 files | Low | Phase 0 |

The work is **wide but shallow** — many files touched, but each change is small and mechanical. Phase 0 is the only part that requires real design decisions (which are captured above). Everything else is find-and-replace with `useColors()`.

---

## The Experience

When a user toggles to Evening Glow:

1. The cream canvas fades to warm charcoal — like dimming the lights
2. White cards become stone-colored surfaces — like wooden furniture in low light
3. The terracotta accent warms into amber — like the text is written in candlelight
4. Text becomes soft cream — never harsh white, always gentle
5. The breathing circle glows deeper against the dark
6. The camera session feels seamless — it was already dark, now the transitions into and out of it are smoother
7. The celebration screen's sparkles feel like actual stars

The soul of the app doesn't change. The warmth doesn't leave. It just settles into evening.
