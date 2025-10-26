import { IUser } from '@/src/types/user';
import { deleteToken, getToken, saveToken } from '@/src/utils/secureStorage';
import { create } from 'zustand';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isInitialized: boolean;
  error: string | null;
  initializeAuth: () => Promise<void>;
  loginUser: (user: IUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<IAuthState>()((set) => ({
  user: null,
  token: null,
  isInitialized: false,
  error: null,

  initializeAuth: async () => {
    set({ error: null });
    try {
      const token = await getToken();
      if (token) {
        set({ token });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize auth';
      console.error('Error initializing auth:', error);
      set({ error: errorMessage });
    } finally {
      set({ isInitialized: true });
    }
  },

  // Called AFTER login API succeeds
  loginUser: async (user: IUser, token: string) => {
    if (!user || !token) {
      set({ error: 'Invalid user or token provided' });
      return;
    }
    try {
      await saveToken(token);
      set({ user, token, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save token';
      console.error('Error saving token:', error);
      set({ error: errorMessage });
    }
  },

  logout: async () => {
    set({ error: null });
    try {
      await deleteToken();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      console.error('Error during logout:', error);
      set({ error: errorMessage });
    } finally {
      set({ user: null, token: null, isInitialized: true });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));
