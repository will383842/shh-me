/**
 * Detects network status and auto-syncs pending offline actions
 * when connectivity is restored, with 500ms debounce.
 */
import { useEffect, useRef, useCallback } from 'react';
import NetInfo, { type NetInfoState } from '@react-native-community/netinfo';
import { useOfflineStore } from '../stores/useOfflineStore';
import type { QueuedAction } from '../types';

interface UseOfflineQueueOptions {
  executor: (action: QueuedAction) => Promise<void>;
}

export function useOfflineQueue({ executor }: UseOfflineQueueOptions): void {
  const syncAll = useOfflineStore((s) => s.syncAll);
  const pendingCount = useOfflineStore((s) => s.pendingActions.length);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trySync = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      void syncAll(executor);
    }, 500);
  }, [syncAll, executor]);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      if (state.isConnected && pendingCount > 0) {
        trySync();
      }
    });

    return () => {
      unsubscribe();
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [pendingCount, trySync]);
}
