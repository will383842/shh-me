/**
 * PULSE Design System — Shh Me
 * 1 primary color + dark mode support
 * ALL colors must go through this file — NEVER hardcode hex/rgba in screens.
 */
export const colors = {
  primary: '#DCFB4E',
  black: '#000000',
  dark: '#111111',
  cardDark: '#1A1A1A',
  borderDark: '#2A2A2A',
  white: '#FFFFFF',
  gray: '#555555',
  grayDark: '#444444',
  grayLight: '#999999',
  danger: '#ff453a',

  textPrimary: '#000000',
  textSecondary: '#555555',
  textDark: '#FFFFFF',
  cardLight: 'rgba(0,0,0,0.10)',
  borderLight: 'rgba(0,0,0,0.10)',

  /* ─── Opacity variants (black on yellow bg) ─── */
  blackAlpha06: 'rgba(0,0,0,0.06)',
  blackAlpha08: 'rgba(0,0,0,0.08)',
  blackAlpha09: 'rgba(0,0,0,0.09)',
  blackAlpha12: 'rgba(0,0,0,0.12)',
  blackAlpha15: 'rgba(0,0,0,0.15)',
  blackAlpha25: 'rgba(0,0,0,0.25)',
  blackAlpha30: 'rgba(0,0,0,0.30)',
  blackAlpha35: 'rgba(0,0,0,0.35)',
  blackAlpha40: 'rgba(0,0,0,0.40)',
  blackAlpha50: 'rgba(0,0,0,0.50)',
  blackAlpha60: 'rgba(0,0,0,0.60)',

  /* ─── Opacity variants (white on dark bg) ─── */
  whiteAlpha20: 'rgba(255,255,255,0.20)',
  whiteAlpha30: 'rgba(255,255,255,0.30)',
  whiteAlpha40: 'rgba(255,255,255,0.40)',
  whiteAlpha60: 'rgba(255,255,255,0.60)',

  /* ─── Opacity variants (primary) ─── */
  primaryAlpha05: 'rgba(220,251,78,0.05)',
  primaryAlpha06: 'rgba(220,251,78,0.06)',
  primaryAlpha08: 'rgba(220,251,78,0.08)',
  primaryAlpha10: 'rgba(220,251,78,0.10)',
  primaryAlpha12: 'rgba(220,251,78,0.12)',
  primaryAlpha15: 'rgba(220,251,78,0.15)',
  primaryAlpha20: 'rgba(220,251,78,0.20)',
  primaryAlpha25: 'rgba(220,251,78,0.25)',
  primaryAlpha30: 'rgba(220,251,78,0.30)',
  primaryAlpha40: 'rgba(220,251,78,0.40)',
  primaryAlpha50: 'rgba(220,251,78,0.50)',
  primaryAlpha60: 'rgba(220,251,78,0.60)',

  /* ─── Danger (red) opacity variants ─── */
  dangerAlpha04: 'rgba(255,69,58,0.04)',
  dangerAlpha06: 'rgba(255,69,58,0.06)',
  dangerAlpha08: 'rgba(255,69,58,0.08)',
  dangerAlpha15: 'rgba(255,69,58,0.15)',
  dangerAlpha20: 'rgba(255,69,58,0.20)',
  dangerAlpha25: 'rgba(255,69,58,0.25)',
  dangerAlpha40: 'rgba(255,69,58,0.40)',
  dangerAlpha60: 'rgba(255,69,58,0.60)',

  /* ─── Semantic ─── */
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
} as const;

export type ColorName = keyof typeof colors;
