import { IUser } from '@/src/types/user';
import { deleteToken, getToken, saveToken } from '@/src/utils/secureStorage';
import { create } from 'zustand';
import { getMyUser } from '../modules/profile/services/profileService';
import { tokenRefreshService } from '../services/tokenRefreshService';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  isInitialized: boolean;
  skipRedirectAfterLogin?: boolean;
  initializeAuth: () => Promise<void>;
  loginUser: (user: IUser, token: string) => Promise<void>;
  setSkipRedirect: (val: boolean) => void;
  fetchAndUpdateUser: () => Promise<void>;
  logout: () => Promise<void>;
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
      if (token) {
        // Validate token by fetching user data
        try {
          set({ token });
          const data = await getMyUser();
          set({
            user: {
              id: data.userId,
              email: '',
              name: data.name,
              username: data.username,
              bio: data.bio,
              avatarUrl: data.avatarUrl,
              coverUrl: data.coverUrl,
              country: data.country || undefined,
              createdAt: data.createdAt,
              followers: data.followersCount,
              following: data.followingCount,
              birthDate: '',
            },
          });
          tokenRefreshService.start();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (validationErr) {
          // Token is invalid, clear it
          await deleteToken();
          set({ user: null, token: null });
        }
      }
    } catch (err) {
      console.error('Auth initialization failed:', err);
      await deleteToken();
      set({ user: null, token: null });
    } finally {
      set({ isInitialized: true });
    }
  },

  /** After successful login */
  loginUser: async (user: IUser, token: string) => {
    try {
      await saveToken(token);
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
          email: '', // Not provided
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
        },
      });
    } catch (err) {
      console.error('Failed to fetch user:', err);
    }
  },

  /** Logout & cleanup */
  logout: async () => {
    try {
      tokenRefreshService.stop();
      await deleteToken();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      set({ user: null, token: null });
    }
  },
}));
