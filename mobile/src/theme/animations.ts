/**
 * PULSE Design System — Animation presets
 * All spring-based (damping 15, stiffness 150) — NEVER linear
 */
import { withSpring, type WithSpringConfig } from 'react-native-reanimated';

export const springConfig: WithSpringConfig = {
  damping: 15,
  stiffness: 150,
  mass: 1,
};

export const springConfigGentle: WithSpringConfig = {
  damping: 20,
  stiffness: 100,
  mass: 1,
};

export const springConfigBouncy: WithSpringConfig = {
  damping: 10,
  stiffness: 200,
  mass: 0.8,
};

export const durations = {
  fast: 150,
  normal: 300,
  slow: 500,
  reveal: 5000,
  shhGesture: 3000,
  appOpenSound: 300,
} as const;

export { withSpring };
