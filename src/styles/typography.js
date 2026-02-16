import { Platform } from 'react-native';

export const typography = {
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 22,
    xxxl: 26,
    title: 30,
    brand: 48,
  },

  // Font weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  // Font families
  fontFamily: {
    serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    serifItalic: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
    sans: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
};

// Pre-composed text styles matching v2 design
export const textStyles = {
  brandTitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: typography.fontSize.brand,
    fontStyle: 'italic',
    color: '#2D2A26',
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: typography.fontWeight.bold,
    color: '#2D2A26',
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#2D2A26',
  },
  bodyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: '#7A756E',
    lineHeight: 24,
  },
  affirmationText: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: typography.fontSize.xl,
    fontStyle: 'italic',
    color: '#2D2A26',
    lineHeight: 30,
  },
  buttonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: '#FFFFFF',
  },
  labelSmall: {
    fontSize: 11,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
  },
};
