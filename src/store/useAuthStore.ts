import i18n, { changeLanguage } from '@/src/i18n';
import { IUser } from '@/src/types/user';
import {
  deleteRefreshToken,
  deleteToken,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from '@/src/utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { logout, logOutAll } from '../modules/auth/services/authService';
import { getMyUser } from '../modules/profile/services/profileService';
import { tokenRefreshService } from '../services/tokenRefreshService';
import { IGetMyUserResponse } from '../modules/profile/types';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isInitialized: boolean;
  skipRedirectAfterLogin?: boolean;
  initializeAuth: () => Promise<void>;
  loginUser: (user: IUser, token: string, refreshToken?: string) => Promise<void>;
  setSkipRedirect: (val: boolean) => void;
  setUserName: (newUsername: string) => void;
  setEmail: (newEmail: string) => void;
  setCountry: (newCountry: string) => void;
  setLanguage: (newLanguage: string) => void;
  fetchAndUpdateUser: () => Promise<void>;
  logout: (all: boolean) => Promise<void>;
}

export const useAuthStore = create<IAuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,
  skipRedirectAfterLogin: false,

  /** Initialize auth on app start */
  initializeAuth: async () => {
    try {
      const token = await getToken();
      const refreshToken = await getRefreshToken();
      if (token) {
        try {
          set({ token });
          const data = await getMyUser();
          set({ user: mapUser(data) });

          // Sync language
          if (data.language && data.language !== i18n.language) {
            await changeLanguage(data.language);
            await AsyncStorage.setItem('app-language', data.language);
          }

          if (refreshToken) {
            tokenRefreshService.start();
          }
        } catch {
          await deleteToken();
          await deleteRefreshToken();
          set({ user: null, token: null });
        }
      } else if (refreshToken) {
        try {
          const newToken = await tokenRefreshService.refreshToken();

          if (!newToken) {
            await deleteRefreshToken();
            set({ user: null, token: null });
          } else {
            await saveToken(newToken);
            set({ token: newToken });

            const data = await getMyUser();
            set({ user: mapUser(data) });

            if (data.language && data.language !== i18n.language) {
              await changeLanguage(data.language);
              await AsyncStorage.setItem('app-language', data.language);
            }

            tokenRefreshService.start();
          }
        } catch {
          await deleteToken();
          await deleteRefreshToken();
          set({ user: null, token: null });
        }
      }
    } catch {
      await deleteToken();
      await deleteRefreshToken();
      set({ user: null, token: null });
    } finally {
      set({ isInitialized: true });
    }
  },

  /** After successful login */
  loginUser: async (user: IUser, token: string, refreshToken?: string) => {
    try {
      await saveToken(token);
      if (refreshToken) {
        await saveRefreshToken(refreshToken);
      }
      set({ user, token });
      tokenRefreshService.start();
    } catch (err) {
      console.error('Login error:', err);
      set({ user: null, token: null });
    }
  },

  /** Optional: skip redirect flag */
  setSkipRedirect: (val: boolean) => set({ skipRedirectAfterLogin: val }),

  /** Refresh user data from server */
  fetchAndUpdateUser: async () => {
    try {
      const data = await getMyUser();
      // Map camelCase response to IUser format
      set({
        user: {
          id: data.userId,
          email: data.email,
          name: data.name,
          username: data.username,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          coverUrl: data.coverUrl,
          country: data.country || undefined,
          createdAt: data.createdAt,
          followers: data.followersCount,
          following: data.followingCount,
          birthDate: data.birthDate || undefined,
          language: data.language || undefined,
        },
      });

      // Sync language from backend with local i18n
      if (data.language && data.language !== i18n.language) {
        await changeLanguage(data.language);
        await AsyncStorage.setItem('app-language', data.language);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  },
  setUserName: (newUsername: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, username: newUsername } : null,
    })),
  setEmail: (newEmail: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, email: newEmail } : null,
    })),
  setCountry: (newCountry: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, country: newCountry } : null,
    })),
  setLanguage: (newLanguage: string) =>
    set((state) => ({
      user: state.user ? { ...state.user, language: newLanguage } : null,
    })),

  /** Logout & cleanup */
  logout: async (all: boolean = false) => {
    try {
      tokenRefreshService.stop();
      await deleteToken();
      await deleteRefreshToken();
      if (all) {
        await logOutAll();
      } else {
        await logout();
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, token: null });
    }
  },
}));

const mapUser = (data: IGetMyUserResponse) => ({
  id: data.userId,
  email: data.email,
  name: data.name,
  username: data.username,
  bio: data.bio,
  avatarUrl: data.avatarUrl,
  coverUrl: data.coverUrl,
  country: data.country,
  createdAt: data.createdAt,
  followers: data.followersCount,
  following: data.followingCount,
  birthDate: data.birthDate,
  language: data.language,
});
