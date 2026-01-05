import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, firstName?: string, lastName?: string) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  updateProfile: (data: { firstName?: string; lastName?: string }) => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.login(email, password);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || 'Login failed');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || 'Login failed',
            isLoading: false,
          });
          throw error;
        }
      },

      register: async (email: string, password: string, firstName?: string, lastName?: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.register(email, password, firstName, lastName);
          if (response.success && response.data) {
            set({
              user: response.data.user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error(response.error || 'Registration failed');
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || 'Registration failed',
            isLoading: false,
          });
          throw error;
        }
      },

      logout: () => {
        api.logout();
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      fetchUser: async () => {
        const token = api.getToken();
        if (!token) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        set({ isLoading: true });
        try {
          const response = await api.getMe();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            throw new Error('Failed to fetch user');
          }
        } catch (error) {
          api.logout();
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      updateProfile: async (data: { firstName?: string; lastName?: string }) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.updateProfile(data);
          if (response.success && response.data) {
            set((state) => ({
              user: state.user ? { ...state.user, ...response.data } : null,
              isLoading: false,
            }));
          }
        } catch (error: any) {
          set({
            error: error.response?.data?.error || error.message || 'Update failed',
            isLoading: false,
          });
          throw error;
        }
      },

      setUser: (user: User) => set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }),

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
