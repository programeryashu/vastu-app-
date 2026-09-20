// ============================================================
// VASTU COMPASS — Premium Design System
// Warm, earthy palette inspired by natural materials & architecture
// ============================================================

import { useColorScheme } from 'react-native';

// ── Light Theme ──
const lightColors = {
  // Core
  primary: '#5D4E37',      // Deep earthy brown
  primaryLight: '#8B7355', // Lighter brown
  accent: '#C9A96E',       // Subtle gold (not overused)
  accentLight: '#E8D5A8',  // Pale gold

  // Backgrounds
  background: '#FAF8F5',   // Warm cream/off-white
  surface: '#FFFFFF',      // Pure white cards
  surfaceSecondary: '#F5F0EB', // Subtle warm gray

  // Text
  text: '#2D2418',         // Deep charcoal brown
  textSecondary: '#7A6F63', // Warm muted brown
  textTertiary: '#A69B90',  // Light muted

  // Semantic
  success: '#4A7C59',      // Natural green
  successLight: '#E8F5EC',
  warning: '#C9893E',      // Warm amber
  warningLight: '#FFF3E0',
  error: '#B54A4A',        // Muted red
  errorLight: '#FDECEC',
  info: '#4A6FA5',         // Calm blue
  infoLight: '#E8F0FA',

  // UI
  border: '#E8E2DA',       // Warm subtle border
  borderLight: '#F0EBE5',
  divider: '#E8E2DA',
  shadow: 'rgba(45, 36, 24, 0.08)',
  overlay: 'rgba(45, 36, 24, 0.5)',

  // Compass specific
  compassRing: '#E8E2DA',
  compassNeedle: '#B54A4A',
  compassNorth: '#B54A4A',
};

// ── Dark Theme ──
const darkColors = {
  // Core
  primary: '#C9A96E',       // Subtle gold
  primaryLight: '#E8D5A8',
  accent: '#C9A96E',
  accentLight: '#E8D5A8',

  // Backgrounds
  background: '#1A1614',    // Deep warm black
  surface: '#2A2520',       // Warm dark card
  surfaceSecondary: '#342E28', // Slightly lighter

  // Text
  text: '#F5F0EB',          // Warm white
  textSecondary: '#A69B90', // Muted warm gray
  textTertiary: '#7A6F63',

  // Semantic
  success: '#6AAF7E',
  successLight: '#1E2E22',
  warning: '#D4A55A',
  warningLight: '#2E2518',
  error: '#D46B6B',
  errorLight: '#2E1C1C',
  info: '#6A8FC5',
  infoLight: '#1C2430',

  // UI
  border: '#3D3530',
  borderLight: '#2A2520',
  divider: '#3D3530',
  shadow: 'rgba(0, 0, 0, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.6)',

  // Compass specific
  compassRing: '#3D3530',
  compassNeedle: '#D46B6B',
  compassNorth: '#D46B6B',
};

// ── Spacing ──
export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
  section: 64,
};

// ── Border Radius ──
export const borderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 999,
};

// ── Typography ──
export const typography = {
  // Display
  display: {
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  // Headings
  h1: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 34,
  },
  h2: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  // Body
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodyMedium: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  // Labels
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  // Compass
  compassDegree: {
    fontSize: 48,
    fontWeight: '300',
    letterSpacing: -1,
  },
  compassDirection: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
};

// ── Shadows ──
export const shadows = {
  none: {},
  xs: {
    shadowColor: '#2D2418',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#2D2418',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#2D2418',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2D2418',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ── Font Weights (for platform consistency) ──
export const fontWeight = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
};

// ── Theme Hook ──
export function useTheme(forceDark = false) {
  const colorScheme = useColorScheme();
  // Default to light mode for the warm cream design
  const isDark = forceDark ? true : false;
  const colors = isDark ? darkColors : lightColors;

  return {
    colors,
    isDark,
    spacing,
    borderRadius,
    typography,
    shadows,
    fontWeight,
  };
}

// ── Default export for non-hook usage ──
export const theme = {
  colors: lightColors,
  spacing,
  borderRadius,
  typography,
  shadows,
  fontWeight,
};

// Legacy exports for backward compatibility
export const colors = lightColors;
