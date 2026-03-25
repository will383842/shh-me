/**
 * ShhCountdown — Countdown circle animation for future reveal feature.
 * Structure ready for Sprint 3+. Not active in Sprint 1-2.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

interface ShhCountdownProps {
  seconds: number;
  isActive: boolean;
}

export default function ShhCountdown({
  seconds,
  isActive,
}: ShhCountdownProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (isActive && seconds > 0) {
      progress.value = 1;
      progress.value = withTiming(0, { duration: seconds * 1000 });
    }
  }, [isActive, seconds, progress]);

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.8 + progress.value * 0.2 }],
    opacity: 0.3 + progress.value * 0.7,
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.circle, circleStyle]}>
        <ShhText variant="display" style={styles.text}>
          {seconds}
        </ShhText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 28,
    color: colors.primary,
  },
});
