/**
 * Manages the 3-second long press gesture for ShhHeartButton.
 * Returns animated progress (0-1), press handlers, and active state.
 */
import { useCallback, useRef } from 'react';
import {
  useSharedValue,
  withTiming,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { durations } from '../theme/animations';

interface UseShhPressOptions {
  onComplete: () => void;
  duration?: number;
}

interface UseShhPressReturn {
  onPressIn: () => void;
  onPressOut: () => void;
  progress: ReturnType<typeof useSharedValue<number>>;
  isActive: ReturnType<typeof useSharedValue<boolean>>;
}

export function useShhPress({
  onComplete,
  duration = durations.shhGesture,
}: UseShhPressOptions): UseShhPressReturn {
  const progress = useSharedValue(0);
  const isActive = useSharedValue(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    isActive.value = false;
    onComplete();
  }, [onComplete, isActive]);

  const onPressIn = useCallback(() => {
    isActive.value = true;
    progress.value = withTiming(1, { duration });

    timerRef.current = setTimeout(() => {
      runOnJS(handleComplete)();
    }, duration);
  }, [progress, isActive, duration, handleComplete]);

  const onPressOut = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    isActive.value = false;
    cancelAnimation(progress);
    progress.value = withTiming(0, { duration: 200 });
  }, [progress, isActive]);

  return { onPressIn, onPressOut, progress, isActive };
}
