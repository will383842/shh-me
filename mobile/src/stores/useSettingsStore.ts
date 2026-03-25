import { create } from 'zustand';

interface SettingsState {
  locale: 'en' | 'fr';
  notificationsEnabled: boolean;
  setLocale: (locale: 'en' | 'fr') => void;
  setNotificationsEnabled: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  locale: 'en',
  notificationsEnabled: true,
  setLocale: (locale) => set({ locale }),
  setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
}));
