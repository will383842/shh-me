/**
 * PULSE Design System — Typography
 * Baloo 2: expressif (logo, titres, BPM, compteurs)
 * DM Sans: lisible (corps, boutons, labels, notifications)
 */
export const typography = {
  display: { fontFamily: 'Baloo2_600SemiBold' },
  displayBold: { fontFamily: 'Baloo2_700Bold' },
  displayExtra: { fontFamily: 'Baloo2_800ExtraBold' },
  body: { fontFamily: 'DMSans_400Regular' },
  bodyMedium: { fontFamily: 'DMSans_500Medium' },
  bodySemiBold: { fontFamily: 'DMSans_600SemiBold' },
  bodyBold: { fontFamily: 'DMSans_700Bold' },
} as const;

export const fontSizes = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;
