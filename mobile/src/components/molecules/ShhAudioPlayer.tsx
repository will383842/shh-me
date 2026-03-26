/**
 * ShhAudioPlayer — Play/pause button with waveform mini bars + duration text.
 * Black play button with primary color icon, animated mini waveform bars.
 */
import React, { useEffect, useState, useCallback } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import ShhText from '../atoms/ShhText';
import { colors } from '../../theme/colors';

interface ShhAudioPlayerProps {
  durationMs: number;
  onPlay?: () => void;
}

const BAR_COUNT = 16;
const BAR_DELAYS = [0, 80, 40, 120, 60, 100, 20, 140, 50, 110, 30, 90, 70, 130, 45, 95];

function WaveformBar({ index, isPlaying }: { index: number; isPlaying: boolean }) {
  const height = useSharedValue(8);

  useEffect(() => {
    if (isPlaying) {
      height.value = withDelay(
        BAR_DELAYS[index % BAR_DELAYS.length],
        withRepeat(
          withSequence(
            withTiming(4 + Math.random() * 20, { duration: 200 + Math.random() * 200 }),
            withTiming(6 + Math.random() * 8, { duration: 200 + Math.random() * 200 }),
          ),
          -1,
          true,
        ),
      );
    } else {
      height.value = withTiming(8, { duration: 300 });
    }
  }, [isPlaying, height, index]);

  const barStyle = useAnimatedStyle(() => ({
    height: height.value,
  }));

  return <Animated.View style={[styles.bar, barStyle]} />;
}

export default function ShhAudioPlayer({ durationMs, onPlay }: ShhAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const formatDuration = useCallback((ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  const handlePress = useCallback(() => {
    setIsPlaying((prev) => !prev);
    onPlay?.();
  }, [onPlay]);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.playButton}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <ShhText variant="body" style={styles.playIcon}>
          {isPlaying ? '⏸' : '▶'}
        </ShhText>
      </TouchableOpacity>

      <View style={styles.waveform}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => (
          <WaveformBar key={i} index={i} isPlaying={isPlaying} />
        ))}
      </View>

      <ShhText variant="body" style={styles.duration}>
        {formatDuration(durationMs)}
      </ShhText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  playButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.black,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 12,
    color: colors.primary,
  },
  waveform: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  bar: {
    flex: 1,
    backgroundColor: colors.primary,
    borderRadius: 2,
    minWidth: 2,
  },
  duration: {
    fontSize: 12,
    color: colors.gray,
  },
});
