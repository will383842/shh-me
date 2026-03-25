import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';
import type { QueuedAction } from '../types';

const storage: MMKV = createMMKV({ id: 'shh-offline-queue' });
const QUEUE_KEY = 'pending_actions';

function loadQueue(): QueuedAction[] {
  const raw = storage.getString(QUEUE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as QueuedAction[];
  } catch {
    return [];
  }
}

function persistQueue(actions: QueuedAction[]): void {
  storage.set(QUEUE_KEY, JSON.stringify(actions));
}

interface OfflineState {
  pendingActions: QueuedAction[];
  isSyncing: boolean;

  queueAction: (action: Omit<QueuedAction, 'id' | 'createdAt'>) => void;
  syncAll: (
    executor: (action: QueuedAction) => Promise<void>,
  ) => Promise<void>;
  clearQueue: () => void;
  loadFromDisk: () => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  pendingActions: loadQueue(),
  isSyncing: false,

  queueAction: (action) => {
    const newAction: QueuedAction = {
      ...action,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      createdAt: Date.now(),
    };
    const updated = [...get().pendingActions, newAction];
    persistQueue(updated);
    set({ pendingActions: updated });
  },

  syncAll: async (executor) => {
    const { pendingActions } = get();
    if (pendingActions.length === 0) return;

    set({ isSyncing: true });
    const remaining: QueuedAction[] = [];

    for (const action of pendingActions) {
      try {
        await executor(action);
      } catch {
        remaining.push(action);
      }
    }

    persistQueue(remaining);
    set({ pendingActions: remaining, isSyncing: false });
  },

  clearQueue: () => {
    persistQueue([]);
    set({ pendingActions: [] });
  },

  loadFromDisk: () => {
    set({ pendingActions: loadQueue() });
  },
}));
