import { create } from 'zustand';
import { User } from '@/types';
import { getToken, setToken, removeToken } from '@/lib/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User, token: string) => void;
  logout: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setUser: (user, token) => {
    setToken(token);
    set({ user, token, isLoading: false });
  },

  logout: () => {
    removeToken();
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mockUser');
      localStorage.removeItem('session_id');
    }
    set({ user: null, token: null });
  },

  initialize: () => {
    const token = getToken();
    if (token && typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        set({ user: JSON.parse(storedUser), token, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
