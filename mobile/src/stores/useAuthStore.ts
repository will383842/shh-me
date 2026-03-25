import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as authService from '../services/auth';

const TOKEN_KEY = 'shh_auth_token';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isNewUser: boolean;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setIsNewUser: (isNew: boolean) => void;
  login: (provider: 'apple' | 'google', idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isNewUser: false,

  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setLoading: (isLoading) => set({ isLoading }),
  setIsNewUser: (isNewUser) => set({ isNewUser }),

  login: async (provider, idToken) => {
    set({ isLoading: true });
    try {
      const response =
        provider === 'apple'
          ? await authService.loginApple(idToken)
          : await authService.loginGoogle(idToken);

      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      set({
        token: response.token,
        isAuthenticated: true,
        isNewUser: response.is_new,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
      throw new Error('auth_failed');
    }
  },

  logout: async () => {
    const { token } = get();
    try {
      if (token) {
        await authService.logout(token);
      }
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      set({ token: null, isAuthenticated: false, isNewUser: false });
    }
  },

  restoreToken: async () => {
    try {
      const stored = await SecureStore.getItemAsync(TOKEN_KEY);
      if (stored) {
        set({ token: stored, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
