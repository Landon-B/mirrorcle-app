// Light palette — warm morning sunlight
export const lightPalette = {
  // Base
  background: '#F5F2EE',
  surface: '#FFFFFF',
  surfaceSecondary: '#F9F7F5',
  surfaceTertiary: '#F0ECE7',

  // Text
  textPrimary: '#2D2A26',
  textSecondary: '#7A756E',
  textMuted: '#B0AAA2',
  textAccent: '#C17666',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#E8E4DF',
  borderSolid: '#DDD8D2',

  // Primary
  primaryStart: '#C17666',
  primaryEnd: '#E8A090',

  // Status colors
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.3)',
  overlayHeavy: 'rgba(0, 0, 0, 0.5)',

  // Disabled
  disabled: '#D4CFC9',

  // Semantic tokens
  cardBackground: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
  selectedMoodBg: '#EDE4DC',
  accentPeach: '#E8D0C6',
  accentRust: '#C17666',
  accentOrange: '#D4845A',
  tabActive: '#C17666',
  tabInactive: '#B0AAA2',

  // Interactive states
  inputBackground: '#FFFFFF',
  inputBorder: '#E8E4DF',
  inputBorderFocused: '#C17666',
  inputPlaceholder: '#B0AAA2',

  // Feeling accent
  feelingPink: '#E8A090',

  // StatusBar
  statusBarStyle: 'dark-content',
};

// Dark palette — evening glow, candlelight on dark wood
export const darkPalette = {
  // Base
  background: '#1C1917',
  surface: '#292524',
  surfaceSecondary: '#1F1B18',
  surfaceTertiary: '#352F2B',

  // Text
  textPrimary: '#F5F2EE',
  textSecondary: '#A8A29E',
  textMuted: '#78716C',
  textAccent: '#D4956E',
  textOnPrimary: '#FFFFFF',

  // Borders
  border: '#3D3835',
  borderSolid: '#44403C',

  // Primary
  primaryStart: '#C17666',
  primaryEnd: '#D4956E',

  // Status colors (brighter for dark bg)
  success: '#4ADE80',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayHeavy: 'rgba(0, 0, 0, 0.7)',

  // Disabled
  disabled: '#44403C',

  // Semantic tokens
  cardBackground: '#292524',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
  selectedMoodBg: '#3D2D27',
  accentPeach: '#3D2D27',
  accentRust: '#D4956E',
  accentOrange: '#D4956E',
  tabActive: '#D4956E',
  tabInactive: '#78716C',

  // Interactive states
  inputBackground: '#292524',
  inputBorder: '#3D3835',
  inputBorderFocused: '#D4956E',
  inputPlaceholder: '#78716C',

  // Feeling accent
  feelingPink: '#D4956E',

  // StatusBar
  statusBarStyle: 'light-content',
};

// Backward compat: `colors` is still the light palette
export const colors = lightPalette;

export const lightGradients = {
  primary: ['#C17666', '#E8A090'],
  background: ['#F9F7F5', '#F5F2EE'],
  success: ['#22C55E', '#10B981'],
  warning: ['#F59E0B', '#F97316'],
  error: ['#EF4444', '#FB7185'],
  info: ['#3B82F6', '#06B6D4'],
  disabled: ['#D4CFC9', '#D4CFC9'],
};

export const darkGradients = {
  primary: ['#C17666', '#D4956E'],
  background: ['#231F1C', '#1C1917'],
  success: ['#4ADE80', '#34D399'],
  warning: ['#FBBF24', '#F59E0B'],
  error: ['#F87171', '#FB7185'],
  info: ['#60A5FA', '#38BDF8'],
  disabled: ['#44403C', '#44403C'],
};

// Backward compat
export const gradients = lightGradients;
