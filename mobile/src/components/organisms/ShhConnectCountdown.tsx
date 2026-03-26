/**
 * ShhConnectCountdown — 5s countdown with animated SVG circle + big number.
 * Uses Reanimated withTiming for smooth stroke animation.
 */
import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  useAnimatedProps,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface ShhConnectCountdownProps {
  count: number;
  totalSeconds: number;
  isActive: boolean;
}

const SIZE = 200;
const STROKE_WIDTH = 4;
const RADIUS = (SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ShhConnectCountdown({
  count,
  totalSeconds,
  isActive,
}: ShhConnectCountdownProps) {
  const progress = useSharedValue(1);

  useEffect(() => {
    if (isActive) {
      progress.value = 1;
      progress.value = withTiming(0, {
        duration: totalSeconds * 1000,
        easing: Easing.linear,
      });
    }
  }, [isActive, totalSeconds, progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: CIRCUMFERENCE * (1 - progress.value),
  }));

  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isActive && count > 0) {
      pulseScale.value = 1.1;
      pulseScale.value = withTiming(1, { duration: 400 });
    }
  }, [count, isActive, pulseScale]);

  const numberStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        {/* Background circle */}
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.borderDark}
          strokeWidth={STROKE_WIDTH}
          fill="none"
        />
        {/* Animated progress circle */}
        <AnimatedCircle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.primary}
          strokeWidth={STROKE_WIDTH}
          fill="none"
          strokeDasharray={CIRCUMFERENCE}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
        />
      </Svg>

      <Animated.View style={[styles.numberContainer, numberStyle]}>
        <ShhText variant="display" style={styles.number}>
          {count}
        </ShhText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    position: 'absolute',
  },
  numberContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 80,
    color: colors.primary,
  },
});
