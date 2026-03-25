import { create } from 'zustand';

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  isAuthenticated: false,
  isLoading: true,
  setToken: (token) => set({ token, isAuthenticated: !!token }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ token: null, isAuthenticated: false }),
}));
