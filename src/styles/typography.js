import { Platform } from 'react-native';

export const typography = {
  // Font sizes — strict scale
  fontSize: {
    xs: 11,
    sm: 12,
    md: 14,
    base: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    title: 28,
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
    serifBold: Platform.OS === 'ios' ? 'Georgia-Bold' : 'serif',
    serifBoldItalic: Platform.OS === 'ios' ? 'Georgia-BoldItalic' : 'serif',
    serifItalic: Platform.OS === 'ios' ? 'Georgia-Italic' : 'serif',
    sans: Platform.OS === 'ios' ? 'System' : 'Roboto',
    display: Platform.OS === 'ios' ? 'Avenir-Heavy' : 'sans-serif-medium',
    displayBlack: Platform.OS === 'ios' ? 'Avenir-Black' : 'sans-serif-black',
  },
};

// Pre-composed text styles matching warm light design
export const textStyles = {
  brandTitle: {
    fontFamily: typography.fontFamily.serifItalic,
    fontSize: typography.fontSize.brand,
    fontStyle: 'italic',
    color: '#2D2A26',
  },
  screenTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: '#2D2A26',
  },
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: '#2D2A26',
  },
  cardTitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: '#2D2A26',
  },
  bodyText: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.regular,
    color: '#7A756E',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.regular,
    color: '#7A756E',
    lineHeight: 20,
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
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#B0AAA2',
  },
  caption: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.regular,
    color: '#7A756E',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: typography.fontWeight.medium,
  },
};
