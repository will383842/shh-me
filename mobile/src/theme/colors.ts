/**
 * PULSE Design System — Shh Me
 * 1 primary color + dark mode support
 */
export const colors = {
  primary: '#DCFB4E',
  black: '#000000',
  dark: '#111111',
  cardDark: '#1A1A1A',
  borderDark: '#2A2A2A',
  white: '#FFFFFF',
  gray: '#555555',

  textPrimary: '#000000',
  textSecondary: '#555555',
  textDark: '#FFFFFF',
  cardLight: 'rgba(0,0,0,0.10)',
  borderLight: 'rgba(0,0,0,0.10)',

  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
} as const;

export type ColorName = keyof typeof colors;
