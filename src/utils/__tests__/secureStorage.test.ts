import * as SecureStore from 'expo-secure-store';
import {
  deleteRefreshToken,
  deleteToken,
  getRefreshToken,
  getToken,
  saveRefreshToken,
  saveToken,
} from '../secureStorage';

jest.mock('expo-secure-store');

const mockedSecureStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('secureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token to secure storage', async () => {
      const token = 'jwt-token-123';
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);

      await saveToken(token);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), token);
    });

    it('should throw error if token is empty', async () => {
      const token = '';

      await expect(saveToken(token)).rejects.toThrow('Token cannot be empty or undefined');
    });

    it('should throw error if token is whitespace only', async () => {
      const token = '   ';

      await expect(saveToken(token)).rejects.toThrow('Token cannot be empty or undefined');
    });

    it('should throw error if token is undefined', async () => {
      const token = undefined as any;

      await expect(saveToken(token)).rejects.toThrow('Token cannot be empty or undefined');
    });

    it('should throw custom error if SecureStore fails', async () => {
      const token = 'valid-token';
      mockedSecureStore.setItemAsync = jest.fn().mockRejectedValue(new Error('Storage error'));

      await expect(saveToken(token)).rejects.toThrow('Failed to save authentication token');
    });

    it('should handle very long tokens', async () => {
      const token = 'x'.repeat(10000);
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);

      await saveToken(token);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should handle tokens with special characters', async () => {
      const token = 'token.with-special_chars@123!#$%';
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);

      await saveToken(token);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith(expect.any(String), token);
    });
  });

  describe('getToken', () => {
    it('should retrieve token from secure storage', async () => {
      const token = 'jwt-token-123';
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(token);

      const result = await getToken();

      expect(result).toBe(token);
      expect(mockedSecureStore.getItemAsync).toHaveBeenCalled();
    });

    it('should return null if token not found', async () => {
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(null);

      const result = await getToken();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockedSecureStore.getItemAsync = jest.fn().mockRejectedValue(new Error('Storage error'));

      const result = await getToken();

      expect(result).toBeNull();
    });

    it('should handle retrieval of very long tokens', async () => {
      const longToken = 'x'.repeat(10000);
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(longToken);

      const result = await getToken();

      expect(result).toBe(longToken);
    });
  });

  describe('deleteToken', () => {
    it('should delete token from secure storage', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockResolvedValue(undefined);

      await deleteToken();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalled();
    });

    it('should throw error if deletion fails', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteToken()).rejects.toThrow('Failed to delete authentication token');
    });

    it('should handle deletion gracefully', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockResolvedValue(undefined);

      await expect(deleteToken()).resolves.not.toThrow();
    });
  });

  describe('saveRefreshToken', () => {
    it('should save refresh token to secure storage', async () => {
      const refreshToken = 'refresh-token-123';
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);

      await saveRefreshToken(refreshToken);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledWith('refreshToken', refreshToken);
    });

    it('should throw error if refresh token is empty', async () => {
      const refreshToken = '';

      await expect(saveRefreshToken(refreshToken)).rejects.toThrow('Refresh token cannot be empty or undefined');
    });

    it('should throw error if refresh token is whitespace only', async () => {
      const refreshToken = '   ';

      await expect(saveRefreshToken(refreshToken)).rejects.toThrow('Refresh token cannot be empty or undefined');
    });

    it('should throw error if refresh token is undefined', async () => {
      const refreshToken = undefined as any;

      await expect(saveRefreshToken(refreshToken)).rejects.toThrow('Refresh token cannot be empty or undefined');
    });

    it('should throw custom error if SecureStore fails', async () => {
      const refreshToken = 'valid-refresh-token';
      mockedSecureStore.setItemAsync = jest.fn().mockRejectedValue(new Error('Storage error'));

      await expect(saveRefreshToken(refreshToken)).rejects.toThrow('Failed to save refresh token');
    });
  });

  describe('getRefreshToken', () => {
    it('should retrieve refresh token from secure storage', async () => {
      const refreshToken = 'refresh-token-123';
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(refreshToken);

      const result = await getRefreshToken();

      expect(result).toBe(refreshToken);
      expect(mockedSecureStore.getItemAsync).toHaveBeenCalledWith('refreshToken');
    });

    it('should return null if refresh token not found', async () => {
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(null);

      const result = await getRefreshToken();

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      mockedSecureStore.getItemAsync = jest.fn().mockRejectedValue(new Error('Storage error'));

      const result = await getRefreshToken();

      expect(result).toBeNull();
    });
  });

  describe('deleteRefreshToken', () => {
    it('should delete refresh token from secure storage', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockResolvedValue(undefined);

      await deleteRefreshToken();

      expect(mockedSecureStore.deleteItemAsync).toHaveBeenCalledWith('refreshToken');
    });

    it('should throw error if deletion fails', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockRejectedValue(new Error('Deletion failed'));

      await expect(deleteRefreshToken()).rejects.toThrow('Failed to delete refresh token');
    });

    it('should handle deletion gracefully', async () => {
      mockedSecureStore.deleteItemAsync = jest.fn().mockResolvedValue(undefined);

      await expect(deleteRefreshToken()).resolves.not.toThrow();
    });
  });

  describe('token lifecycle', () => {
    it('should save and retrieve token correctly', async () => {
      const token = 'test-token-123';
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(token);

      await saveToken(token);
      const retrieved = await getToken();

      expect(retrieved).toBe(token);
    });

    it('should handle save and delete token', async () => {
      const token = 'test-token-123';
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);
      mockedSecureStore.deleteItemAsync = jest.fn().mockResolvedValue(undefined);
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue(null);

      await saveToken(token);
      await deleteToken();
      const retrieved = await getToken();

      expect(retrieved).toBeNull();
    });

    it('should independently manage auth and refresh tokens', async () => {
      const token = 'auth-token';
      const refreshToken = 'refresh-token';

      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);
      mockedSecureStore.getItemAsync = jest.fn().mockImplementation((key) => {
        if (key === 'refreshToken') return Promise.resolve(refreshToken);
        return Promise.resolve(token);
      });

      await saveToken(token);
      await saveRefreshToken(refreshToken);

      const authToken = await getToken();
      const refToken = await getRefreshToken();

      expect(authToken).toBe(token);
      expect(refToken).toBe(refreshToken);
    });
  });

  describe('concurrent operations', () => {
    it('should handle concurrent saves', async () => {
      mockedSecureStore.setItemAsync = jest.fn().mockResolvedValue(undefined);

      const token1 = 'token-1';
      const refreshToken1 = 'refresh-1';

      await Promise.all([saveToken(token1), saveRefreshToken(refreshToken1)]);

      expect(mockedSecureStore.setItemAsync).toHaveBeenCalledTimes(2);
    });

    it('should handle concurrent retrievals', async () => {
      mockedSecureStore.getItemAsync = jest.fn().mockResolvedValue('some-token');

      const [token, refreshToken] = await Promise.all([getToken(), getRefreshToken()]);

      expect(token).toBe('some-token');
      expect(refreshToken).toBe('some-token');
    });
  });
});
