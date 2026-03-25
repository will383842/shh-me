/**
 * ShhBpmDisplay — Animated BPM text with pulsing animation.
 * Uses Reanimated withRepeat + withSequence for heartbeat effect.
 */
import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { typography } from '../../theme/typography';
import { colors } from '../../theme/colors';

interface ShhBpmDisplayProps {
  bpm: number;
}

export default function ShhBpmDisplay({ bpm }: ShhBpmDisplayProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    const beatDuration = bpm > 0 ? (60 / bpm) * 1000 : 1000;
    const half = beatDuration / 2;

    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: half * 0.3 }),
        withTiming(1, { duration: half * 0.7 }),
      ),
      -1,
      false,
    );
  }, [bpm, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.Text style={[styles.text, animatedStyle]}>
      {bpm} bpm
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  text: {
    ...typography.display,
    fontSize: 14,
    color: colors.primary,
  },
});
