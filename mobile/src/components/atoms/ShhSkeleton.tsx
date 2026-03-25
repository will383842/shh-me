/**
 * ShhSkeleton — Shimmer loading placeholder using Reanimated.
 * NEVER show a spinner — always use this skeleton.
 */
import React, { useEffect } from 'react';
import { StyleSheet, View, type DimensionValue } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { colors } from '../../theme/colors';

interface ShhSkeletonProps {
  width: DimensionValue;
  height: number;
  borderRadius?: number;
}

export default function ShhSkeleton({
  width,
  height,
  borderRadius = 8,
}: ShhSkeletonProps) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[styles.container, { width, height, borderRadius }]}>
      <Animated.View
        style={[styles.shimmer, { borderRadius }, animatedStyle]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  shimmer: {
    flex: 1,
    backgroundColor: colors.borderDark,
  },
});
