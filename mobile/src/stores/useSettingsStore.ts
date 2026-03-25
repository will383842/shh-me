import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import type { MMKV } from 'react-native-mmkv';

const storage: MMKV = createMMKV({ id: 'shh-settings' });

interface SettingsState {
  locale: 'en' | 'fr';
  notificationsEnabled: boolean;
  setLocale: (locale: 'en' | 'fr') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: (storage.getString('locale') as 'en' | 'fr') || 'en',
  notificationsEnabled: true,
  setLocale: (locale) => {
    storage.set('locale', locale);
    set({ locale });
  },
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
