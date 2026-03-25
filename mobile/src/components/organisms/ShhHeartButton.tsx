/**
 * ShhHeartButton — THE core interaction component.
 * Hold for 3 seconds with progressive haptic feedback.
 * Animated scale (1.0 → 1.2). On complete: haptic success + sound + confetti.
 */
import React, { useCallback } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useShhPress } from '../../hooks/useShhPress';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

interface ShhHeartButtonProps {
  onComplete: () => void;
}

export default function ShhHeartButton({ onComplete }: ShhHeartButtonProps) {
  const { t } = useTranslation();

  const handleComplete = useCallback(async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onComplete();
  }, [onComplete]);

  const { onPressIn, onPressOut, progress } = useShhPress({
    onComplete: handleComplete,
  });

  // Progressive haptics during hold
  const handlePressIn = useCallback(() => {
    onPressIn();

    // Schedule haptic pulses at 0.5s intervals: Light → Medium → Heavy pattern
    const hapticPattern = [
      { delay: 500, style: Haptics.ImpactFeedbackStyle.Light },
      { delay: 1000, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 1500, style: Haptics.ImpactFeedbackStyle.Medium },
      { delay: 2000, style: Haptics.ImpactFeedbackStyle.Heavy },
      { delay: 2500, style: Haptics.ImpactFeedbackStyle.Heavy },
    ];

    const timers = hapticPattern.map(({ delay, style }) =>
      setTimeout(() => {
        void Haptics.impactAsync(style);
      }, delay),
    );

    // Store timers for cleanup on pressOut
    (handlePressIn as unknown as { _timers: ReturnType<typeof setTimeout>[] })._timers = timers;
  }, [onPressIn]);

  const handlePressOut = useCallback(() => {
    onPressOut();
    const timers = (handlePressIn as unknown as { _timers?: ReturnType<typeof setTimeout>[] })._timers;
    timers?.forEach(clearTimeout);
  }, [onPressOut, handlePressIn]);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: interpolate(progress.value, [0, 1], [1, 1.2]) },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.button, buttonStyle]}>
          <ShhText variant="display" style={styles.emoji}>
            {'\ud83e\udd2b'}
          </ShhText>
        </Animated.View>
      </Pressable>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressStyle]} />
      </View>

      <ShhText variant="body" style={styles.hint}>
        {t('shh.send.holdToSend')}
      </ShhText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
  },
  button: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  emoji: {
    fontSize: 48,
  },
  progressTrack: {
    width: 120,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.borderDark,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  hint: {
    fontSize: 13,
    color: colors.gray,
  },
});
