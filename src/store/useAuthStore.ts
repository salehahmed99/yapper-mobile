import { IUser } from '@/src/types/user';
import { deleteToken, getToken, saveToken } from '@/src/utils/secureStorage';
import { create } from 'zustand';
import { getMyUser } from '../modules/profile/services/profileService';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isInitialized: boolean;
  initializeAuth: () => Promise<void>;
  loginUser: (user: IUser, token: string) => Promise<void>;
  fetchAndUpdateUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<IAuthState>()((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  initializeAuth: async () => {
    try {
      const token = await getToken();
      if (token) {
        set({ token });
      }
    } catch (error) {
      await deleteToken();
      set({ user: null, token: null });
      console.error('Error during auth initialization:', error);
    } finally {
      set({ isInitialized: true });
    }
  },

  // Called AFTER login API succeeds
  loginUser: async (user: IUser, token: string) => {
    if (!user || !token) return;
    try {
      await saveToken(token);
      set({ user, token });
    } catch (error) {
      set({ user: null, token: null });
      console.error('Error logging in:', error);
    }
  },

  // Fetch current user data and update store
  fetchAndUpdateUser: async () => {
    try {
      const response = await getMyUser();
      set({ user: response.data });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  },

  logout: async () => {
    try {
      await deleteToken();
    } catch (error) {
      console.error('Error deleting token during logout:', error);
    } finally {
      set({ user: null, token: null });
    }
  },
}));
