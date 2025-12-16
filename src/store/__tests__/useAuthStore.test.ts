import { changeLanguage } from '@/src/i18n';
import * as SecureStorage from '@/src/utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthService from '../../modules/auth/services/authService';
import * as ProfileService from '../../modules/profile/services/profileService';
import { socketService } from '../../services/socketService';
import { tokenRefreshService } from '../../services/tokenRefreshService';
import { useAuthStore } from '../useAuthStore';

// Mock dependencies
jest.mock('@/src/utils/secureStorage');
jest.mock('../../modules/auth/services/authService');
jest.mock('../../modules/profile/services/profileService');
jest.mock('../../services/socketService');
jest.mock('../../services/tokenRefreshService');
jest.mock('@/src/i18n', () => ({
  __esModule: true,
  default: {
    language: 'en',
  },
  changeLanguage: jest.fn(),
}));
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
}));

describe('useAuthStore', () => {
  const mockUser = {
    userId: '123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    bio: 'Hello',
    avatarUrl: 'http://avatar',
    coverUrl: 'http://cover',
    country: 'US',
    createdAt: '2023-01-01',
    followersCount: 10,
    followingCount: 5,
    birthDate: '1990-01-01',
    language: 'en',
  };

  const mappedUser = {
    id: '123',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    bio: 'Hello',
    avatarUrl: 'http://avatar',
    coverUrl: 'http://cover',
    country: 'US',
    createdAt: '2023-01-01',
    followers: 10,
    following: 5,
    birthDate: '1990-01-01',
    language: 'en',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore.setState({
      user: null,
      token: null,
      isInitialized: false,
      skipRedirectAfterLogin: false,
    });
  });

  describe('initializeAuth', () => {
    it('should initialize successfully with existing token', async () => {
      (SecureStorage.getToken as jest.Mock).mockResolvedValue('valid-token');
      (SecureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
      (ProfileService.getMyUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().token).toBe('valid-token');
      expect(useAuthStore.getState().user).toEqual(mappedUser);
      expect(useAuthStore.getState().isInitialized).toBe(true);
      expect(tokenRefreshService.start).toHaveBeenCalled();
      expect(socketService.connect).toHaveBeenCalled();
    });

    it('should initialize successfully with new token if old token is missing but refresh token exists', async () => {
      (SecureStorage.getToken as jest.Mock).mockResolvedValue(null);
      (SecureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
      (tokenRefreshService.refreshToken as jest.Mock).mockResolvedValue('new-token');
      (ProfileService.getMyUser as jest.Mock).mockResolvedValue(mockUser);

      await useAuthStore.getState().initializeAuth();

      expect(SecureStorage.saveToken).toHaveBeenCalledWith('new-token');
      expect(useAuthStore.getState().token).toBe('new-token');
      expect(useAuthStore.getState().user).toEqual(mappedUser);
      expect(tokenRefreshService.start).toHaveBeenCalled();
      expect(socketService.connect).toHaveBeenCalled();
    });

    it('should fail initialization if refresh token fails', async () => {
      (SecureStorage.getToken as jest.Mock).mockResolvedValue(null);
      (SecureStorage.getRefreshToken as jest.Mock).mockResolvedValue('refresh-token');
      (tokenRefreshService.refreshToken as jest.Mock).mockResolvedValue(null);

      await useAuthStore.getState().initializeAuth();

      expect(SecureStorage.deleteRefreshToken).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should handle getMyUser failure when token exists', async () => {
      (SecureStorage.getToken as jest.Mock).mockResolvedValue('valid-token');
      (ProfileService.getMyUser as jest.Mock).mockRejectedValue(new Error('Network error'));

      await useAuthStore.getState().initializeAuth();

      expect(SecureStorage.deleteToken).toHaveBeenCalled();
      expect(SecureStorage.deleteRefreshToken).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should handle socket connection failure gracefully', async () => {
      (SecureStorage.getToken as jest.Mock).mockResolvedValue('valid-token');
      (ProfileService.getMyUser as jest.Mock).mockResolvedValue(mockUser);
      (socketService.connect as jest.Mock).mockRejectedValue(new Error('Socket error'));
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      await useAuthStore.getState().initializeAuth();

      expect(useAuthStore.getState().token).toBe('valid-token'); // Still authenticated
      expect(consoleSpy).toHaveBeenCalledWith('Socket connection failed, but auth remains valid:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('loginUser', () => {
    it('should login user and save tokens', async () => {
      await useAuthStore.getState().loginUser(mappedUser, 'new-token', 'new-refresh-token');

      expect(SecureStorage.saveToken).toHaveBeenCalledWith('new-token');
      expect(SecureStorage.saveRefreshToken).toHaveBeenCalledWith('new-refresh-token');
      expect(useAuthStore.getState().user).toEqual(mappedUser);
      expect(useAuthStore.getState().token).toBe('new-token');
      expect(tokenRefreshService.start).toHaveBeenCalled();
      expect(socketService.connect).toHaveBeenCalled();
    });

    it('should sync language on login', async () => {
      const userWithLang = { ...mappedUser, language: 'es' };
      await useAuthStore.getState().loginUser(userWithLang, 'token');

      expect(changeLanguage).toHaveBeenCalledWith('es');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith('app-language', 'es');
    });

    it('should handle login error', async () => {
      (SecureStorage.saveToken as jest.Mock).mockRejectedValue(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await useAuthStore.getState().loginUser(mappedUser, 'token');

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith('Login error:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('fetchAndUpdateUser', () => {
    it('should fetch and update user data', async () => {
      useAuthStore.setState({ user: mappedUser, token: 'token' });
      const updatedUser = { ...mockUser, name: 'Updated Name', language: 'fr' };
      (ProfileService.getMyUser as jest.Mock).mockResolvedValue(updatedUser);

      await useAuthStore.getState().fetchAndUpdateUser();

      expect(useAuthStore.getState().user?.name).toBe('Updated Name');
      expect(changeLanguage).toHaveBeenCalledWith('fr');
    });

    it('should handle fetch error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      (ProfileService.getMyUser as jest.Mock).mockRejectedValue(new Error('Fetch error'));

      await useAuthStore.getState().fetchAndUpdateUser();

      expect(consoleSpy).toHaveBeenCalledWith('Failed to fetch user:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('setters', () => {
    beforeEach(() => {
      useAuthStore.setState({ user: mappedUser });
    });

    it('should set skipRedirect', () => {
      useAuthStore.getState().setSkipRedirect(true);
      expect(useAuthStore.getState().skipRedirectAfterLogin).toBe(true);
    });

    it('should set username', () => {
      useAuthStore.getState().setUserName('newuser');
      expect(useAuthStore.getState().user?.username).toBe('newuser');
    });

    it('should set email', () => {
      useAuthStore.getState().setEmail('new@example.com');
      expect(useAuthStore.getState().user?.email).toBe('new@example.com');
    });

    it('should set country', () => {
      useAuthStore.getState().setCountry('CA');
      expect(useAuthStore.getState().user?.country).toBe('CA');
    });

    it('should set language', () => {
      useAuthStore.getState().setLanguage('de');
      expect(useAuthStore.getState().user?.language).toBe('de');
    });
  });

  describe('updateFollowCounts', () => {
    it('should increment following count', () => {
      useAuthStore.setState({ user: mappedUser });
      useAuthStore.getState().updateFollowCounts(true);
      expect(useAuthStore.getState().user?.following).toBe(6);
    });

    it('should decrement following count', () => {
      useAuthStore.setState({ user: mappedUser });
      useAuthStore.getState().updateFollowCounts(false);
      expect(useAuthStore.getState().user?.following).toBe(4);
    });

    it('should not decrement below 0', () => {
      useAuthStore.setState({ user: { ...mappedUser, following: 0 } });
      useAuthStore.getState().updateFollowCounts(false);
      expect(useAuthStore.getState().user?.following).toBe(0);
    });
  });

  describe('logout', () => {
    it('should logout and clear state', async () => {
      useAuthStore.setState({ user: mappedUser, token: 'token' });
      await useAuthStore.getState().logout(false);

      expect(tokenRefreshService.stop).toHaveBeenCalled();
      expect(SecureStorage.deleteToken).toHaveBeenCalled();
      expect(socketService.disconnect).toHaveBeenCalled();
      expect(AuthService.logout).toHaveBeenCalled();
      expect(SecureStorage.deleteRefreshToken).toHaveBeenCalled();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().token).toBeNull();
    });

    it('should handle logout error but still clear state', async () => {
      useAuthStore.setState({ user: mappedUser, token: 'token' });
      (AuthService.logout as jest.Mock).mockRejectedValue(new Error('Logout failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await useAuthStore.getState().logout(false);

      expect(consoleSpy).toHaveBeenCalledWith('Logout error:', expect.any(Error));
      expect(useAuthStore.getState().user).toBeNull();
      consoleSpy.mockRestore();
    });
  });
});
