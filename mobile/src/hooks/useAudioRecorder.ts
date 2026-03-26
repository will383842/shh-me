/**
 * useAudioRecorder — Simple timer-based recorder hook.
 * In demo mode, runs a timer without actual recording.
 * Returns recording state, duration, and control functions.
 */
import { useState, useRef, useCallback } from 'react';

const MAX_DURATION_MS = 30000;

interface UseAudioRecorderReturn {
  isRecording: boolean;
  duration: number;
  recordedUri: string | null;
  hasRecording: boolean;
  startRecording: () => void;
  stopRecording: () => void;
  resetRecording: () => void;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [recordedUri, setRecordedUri] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startRecording = useCallback(() => {
    setRecordedUri(null);
    setDuration(0);
    setIsRecording(true);
    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const currentDuration = Math.min(elapsed, MAX_DURATION_MS);
      setDuration(currentDuration);

      if (currentDuration >= MAX_DURATION_MS) {
        clearTimer();
        setIsRecording(false);
        setRecordedUri(`demo://audio_${Date.now()}.m4a`);
      }
    }, 100);
  }, [clearTimer]);

  const stopRecording = useCallback(() => {
    if (!isRecording) return;
    clearTimer();
    setIsRecording(false);
    const finalDuration = Math.min(
      Date.now() - startTimeRef.current,
      MAX_DURATION_MS,
    );
    setDuration(finalDuration);
    setRecordedUri(`demo://audio_${Date.now()}.m4a`);
  }, [isRecording, clearTimer]);

  const resetRecording = useCallback(() => {
    clearTimer();
    setIsRecording(false);
    setDuration(0);
    setRecordedUri(null);
  }, [clearTimer]);

  return {
    isRecording,
    duration,
    recordedUri,
    hasRecording: recordedUri !== null,
    startRecording,
    stopRecording,
    resetRecording,
  };
}
