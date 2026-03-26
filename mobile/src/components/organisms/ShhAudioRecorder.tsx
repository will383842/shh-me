/**
 * ShhAudioRecorder — Record button with timer + animated waveform bars.
 * Uses Reanimated for bar animations. Timer-based demo recording.
 */
import React, { useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

interface ShhAudioRecorderProps {
  isRecording: boolean;
  durationMs: number;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const WAVEFORM_BAR_COUNT = 24;
const BAR_SEEDS = [12, 18, 8, 22, 14, 6, 20, 10, 16, 24, 7, 19, 11, 23, 9, 17, 5, 21, 13, 15, 8, 20, 10, 18];

function AnimatedBar({ index, isActive }: { index: number; isActive: boolean }) {
  const barHeight = useSharedValue(6);

  useEffect(() => {
    if (isActive) {
      const seed = BAR_SEEDS[index % BAR_SEEDS.length];
      barHeight.value = withDelay(
        index * 40,
        withRepeat(
          withSequence(
            withTiming(seed + Math.random() * 30, { duration: 250 + Math.random() * 150 }),
            withTiming(4 + Math.random() * 10, { duration: 250 + Math.random() * 150 }),
          ),
          -1,
          true,
        ),
      );
    } else {
      barHeight.value = withTiming(6, { duration: 400 });
    }
  }, [isActive, barHeight, index]);

  const style = useAnimatedStyle(() => ({
    height: barHeight.value,
  }));

  return <Animated.View style={[styles.waveformBar, style]} />;
}

export default function ShhAudioRecorder({
  isRecording,
  durationMs,
  onStartRecording,
  onStopRecording,
}: ShhAudioRecorderProps) {
  const { t } = useTranslation();

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const timerDisplay = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <View style={styles.container}>
      {/* Waveform */}
      <View style={styles.waveformContainer}>
        {Array.from({ length: WAVEFORM_BAR_COUNT }).map((_, i) => (
          <AnimatedBar key={i} index={i} isActive={isRecording} />
        ))}
      </View>

      {/* Timer */}
      <ShhText variant="display" style={styles.timer}>
        {timerDisplay}
      </ShhText>

      <ShhText variant="body" style={styles.limitText}>
        {t('audio.maxDuration')}
      </ShhText>

      {/* Record button */}
      <TouchableOpacity
        style={[styles.recordButton, isRecording && styles.recordButtonActive]}
        onPress={isRecording ? onStopRecording : onStartRecording}
        activeOpacity={0.8}
      >
        {isRecording ? (
          <View style={styles.stopSquare} />
        ) : (
          <View style={styles.recordDot} />
        )}
      </TouchableOpacity>

      <ShhText variant="body" style={styles.hint}>
        {isRecording
          ? t('audio.tapToStop')
          : t('audio.tapToRecord')}
      </ShhText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    backgroundColor: colors.cardDark,
    borderRadius: 14,
    height: 72,
    width: '100%',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  waveformBar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 2,
    minWidth: 2,
    maxWidth: 6,
  },
  timer: {
    fontSize: 52,
    color: colors.white,
    marginBottom: 4,
  },
  limitText: {
    fontSize: 12,
    color: colors.gray,
    marginBottom: 32,
  },
  recordButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  recordButtonActive: {
    backgroundColor: colors.primary,
  },
  recordDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.danger,
  },
  stopSquare: {
    width: 22,
    height: 22,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  hint: {
    fontSize: 12,
    color: colors.grayDark,
  },
});
