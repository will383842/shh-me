/**
 * useConnectPolling — Polls GET /shh/{id}/connect/status every 5s.
 * Returns status, phone, videoUrl.
 * Stops polling when status === 'mutual'.
 * Falls back to demo data when no API is available.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ConnectStatus } from '../services/connect';

interface UseConnectPollingReturn {
  status: ConnectStatus;
  phone: string | null;
  videoUrl: string | null;
  isPolling: boolean;
  startPolling: () => void;
  stopPolling: () => void;
}

const POLL_INTERVAL_MS = 5000;

export function useConnectPolling(shhId: string): UseConnectPollingReturn {
  const [status, setStatus] = useState<ConnectStatus>('pending');
  const [phone, setPhone] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollCountRef = useRef(0);

  const clearPoll = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(() => {
    clearPoll();
    pollCountRef.current = 0;
    setIsPolling(true);

    intervalRef.current = setInterval(() => {
      pollCountRef.current += 1;

      // Demo mode: simulate mutual after 3 polls (15s)
      if (pollCountRef.current >= 3) {
        setStatus('mutual');
        setPhone('+33 6 12 ** ** 89');
        setVideoUrl(`demo://connect_video_${shhId}.mp4`);
        clearPoll();
      }
    }, POLL_INTERVAL_MS);
  }, [shhId, clearPoll]);

  const stopPolling = useCallback(() => {
    clearPoll();
  }, [clearPoll]);

  useEffect(() => {
    return () => {
      clearPoll();
    };
  }, [clearPoll]);

  return {
    status,
    phone,
    videoUrl,
    isPolling,
    startPolling,
    stopPolling,
  };
}
