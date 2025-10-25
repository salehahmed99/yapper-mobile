import { create } from 'zustand';
import { createJSONStorage, persist, StateStorage } from 'zustand/middleware';
import { IUser } from '../../../types/user';
import { deleteToken, getToken, saveToken } from '../../../utils/secureStorage';
import { login } from '../services/authService';
import { ILoginCredentials } from '../utils/types';

interface IAuthState {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  isInitialized: boolean;
  loginUser: (credentials: ILoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const secureStorage: StateStorage = {
  getItem: async (): Promise<string | null> => {
    try {
      const token = await getToken();
      if (token) {
        return JSON.stringify({ state: { token } });
      }
      return null;
    } catch (error) {
      console.error('Error getting token from secure storage:', error);
      return null;
    }
  },
  setItem: async (value: string): Promise<void> => {
    try {
      let token: string | null = null;
      try {
        const parsed = JSON.parse(value);
        token = parsed?.state?.token ?? parsed?.token ?? null;
      } catch {
        token = value;
      }

      if (token) {
        await saveToken(token);
      }
    } catch (error) {
      console.error('Error saving token to secure storage:', error);
    }
  },
  removeItem: async (): Promise<void> => {
    try {
      await deleteToken();
    } catch (error) {
      console.error('Error removing token from secure storage:', error);
    }
  },
};

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      isInitialized: false,

      initializeAuth: async () => {
        try {
          const token = await getToken();
          if (token) {
            set({ token });
          }
        } catch (error) {
          console.error('Error initializing auth:', error);
        } finally {
          set({ isInitialized: true });
        }
      },

      loginUser: async (credentials: ILoginCredentials) => {
        set({ loading: true });
        try {
          const res = await login(credentials);
          const user = res?.data?.user || null;
          const token = res?.data?.access_token || null;

          if (!token) {
            throw new Error('No access token received from server.');
          }
          set({ user, token });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await deleteToken();
        } catch (error) {
          console.error('Error during logout:', error);
        } finally {
          //! always clear user and token on logout
          set({ loading: false, user: null, token: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => secureStorage),
      partialize: (state: IAuthState) => ({ token: state.token }),
    },
  ),
);
