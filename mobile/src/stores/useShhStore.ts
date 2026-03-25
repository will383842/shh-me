import { create } from 'zustand';
import type { Shh, ShhMessage, SendShhPayload } from '../types';
import * as shhService from '../services/shh';
import { useAuthStore } from './useAuthStore';

interface ShhState {
  shhList: Shh[];
  currentShh: Shh | null;
  messages: ShhMessage[];
  isLoading: boolean;
  nextCursor: string | null;

  fetchShhList: () => Promise<void>;
  fetchMore: () => Promise<void>;
  fetchShhDetail: (id: string) => Promise<void>;
  sendShh: (data: SendShhPayload) => Promise<Shh>;
  sendMessage: (shhId: string, content: string) => Promise<void>;
  refreshBlurLevel: (shhId: string) => Promise<void>;
  reset: () => void;
}

function getToken(): string {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error('not_authenticated');
  return token;
}

export const useShhStore = create<ShhState>((set, get) => ({
  shhList: [],
  currentShh: null,
  messages: [],
  isLoading: false,
  nextCursor: null,

  fetchShhList: async () => {
    set({ isLoading: true });
    try {
      const result = await shhService.getShhList(getToken());
      set({ shhList: result.data, nextCursor: result.next_cursor, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchMore: async () => {
    const { nextCursor, shhList } = get();
    if (!nextCursor) return;
    try {
      const result = await shhService.getShhList(getToken(), nextCursor);
      set({
        shhList: [...shhList, ...result.data],
        nextCursor: result.next_cursor,
      });
    } catch {
      // silently fail on pagination
    }
  },

  fetchShhDetail: async (id) => {
    set({ isLoading: true });
    try {
      const shh = await shhService.getShhDetail(id, getToken());
      set({ currentShh: shh, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  sendShh: async (data) => {
    set({ isLoading: true });
    try {
      const shh = await shhService.sendShh(data, getToken());
      set((state) => ({
        shhList: [shh, ...state.shhList],
        isLoading: false,
      }));
      return shh;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  sendMessage: async (shhId, content) => {
    try {
      const message = await shhService.sendMessage(shhId, content, getToken());
      set((state) => ({
        messages: [...state.messages, message],
      }));
    } catch {
      // handled by offline queue
    }
  },

  refreshBlurLevel: async (shhId) => {
    try {
      const shh = await shhService.getShhDetail(shhId, getToken());
      set((state) => ({
        currentShh:
          state.currentShh?.id === shhId ? shh : state.currentShh,
        shhList: state.shhList.map((s) => (s.id === shhId ? shh : s)),
      }));
    } catch {
      // silent refresh
    }
  },

  reset: () =>
    set({
      shhList: [],
      currentShh: null,
      messages: [],
      isLoading: false,
      nextCursor: null,
    }),
}));
