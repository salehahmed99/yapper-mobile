import api from '@/src/services/apiClient';
import { useAuthStore } from '@/src/store/useAuthStore';
import * as errorExtraction from '@/src/utils/errorExtraction';
import { changePassword, changeUsername, confirmCurrentPassword, deleteAccount } from '../yourAccountService';

jest.mock('@/src/services/apiClient');
jest.mock('@/src/utils/errorExtraction');
jest.mock('@/src/store/useAuthStore');

const mockApi = api as jest.Mocked<typeof api>;
const mockUseAuthStore = useAuthStore as jest.Mocked<typeof useAuthStore>;

describe('yourAccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(errorExtraction.extractErrorMessage).mockImplementation((error: any) => {
      if (error instanceof Error) return error.message;
      return String(error);
    });
  });

  describe('confirmCurrentPassword', () => {
    it('should return true when password is valid', async () => {
      const mockResponse = { data: { data: { valid: true } } };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmCurrentPassword({ password: 'test123' });

      expect(result).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/confirm-password', { password: 'test123' });
    });

    it('should return false when password is invalid', async () => {
      const mockResponse = { data: { data: { valid: false } } };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await confirmCurrentPassword({ password: 'wrong' });

      expect(result).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const error = new Error('API Error');
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('API Error');

      await expect(confirmCurrentPassword({ password: 'test' })).rejects.toThrow('API Error');
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network timeout');
      mockApi.post = jest.fn().mockRejectedValue(networkError);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Network timeout');

      await expect(confirmCurrentPassword({ password: 'test' })).rejects.toThrow('Network timeout');
    });
  });

  describe('changePassword', () => {
    it('should return true on successful password change', async () => {
      const mockResponse = { status: 200 };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await changePassword({
        currentPassword: 'old123',
        newPassword: 'new456',
      });

      expect(result).toBe(true);
      expect(mockApi.post).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'old123',
        newPassword: 'new456',
      });
    });

    it('should return true with 201 status', async () => {
      const mockResponse = { status: 201 };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await changePassword({
        currentPassword: 'old123',
        newPassword: 'new456',
      });

      expect(result).toBe(true);
    });

    it('should return false with other status codes', async () => {
      const mockResponse = { status: 400 };
      mockApi.post = jest.fn().mockResolvedValue(mockResponse);

      const result = await changePassword({
        currentPassword: 'old123',
        newPassword: 'new456',
      });

      expect(result).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Password change failed');
      mockApi.post = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Password change failed');

      await expect(changePassword({ currentPassword: 'old', newPassword: 'new' })).rejects.toThrow(
        'Password change failed',
      );
    });
  });

  describe('deleteAccount', () => {
    it('should return true on successful deletion', async () => {
      const mockResponse = { status: 200 };
      mockApi.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await deleteAccount();

      expect(result).toBe(true);
      expect(mockApi.delete).toHaveBeenCalledWith('/users/me/delete-account');
    });

    it('should return true with 201 status', async () => {
      const mockResponse = { status: 201 };
      mockApi.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await deleteAccount();

      expect(result).toBe(true);
    });

    it('should return false with other status codes', async () => {
      const mockResponse = { status: 400 };
      mockApi.delete = jest.fn().mockResolvedValue(mockResponse);

      const result = await deleteAccount();

      expect(result).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Deletion failed');
      mockApi.delete = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Deletion failed');

      await expect(deleteAccount()).rejects.toThrow('Deletion failed');
    });
  });

  describe('changeUsername', () => {
    it('should return true on successful username change', async () => {
      const mockResponse = { status: 200 };
      mockApi.patch = jest.fn().mockResolvedValue(mockResponse);
      mockUseAuthStore.getState = jest.fn(() => ({
        setUserName: jest.fn(),
      }));

      const result = await changeUsername('newusername');

      expect(result).toBe(true);
      expect(mockApi.patch).toHaveBeenCalledWith('/users/me', { username: 'newusername' });
    });

    it('should call setUserName on success', async () => {
      const mockSetUserName = jest.fn();
      const mockResponse = { status: 200 };
      mockApi.patch = jest.fn().mockResolvedValue(mockResponse);
      mockUseAuthStore.getState = jest.fn(() => ({
        setUserName: mockSetUserName,
      }));

      await changeUsername('newusername');

      expect(mockSetUserName).toHaveBeenCalledWith('newusername');
    });

    it('should return true with 201 status', async () => {
      const mockResponse = { status: 201 };
      mockApi.patch = jest.fn().mockResolvedValue(mockResponse);
      mockUseAuthStore.getState = jest.fn(() => ({
        setUserName: jest.fn(),
      }));

      const result = await changeUsername('newusername');

      expect(result).toBe(true);
    });

    it('should return false on unsuccessful change', async () => {
      const mockResponse = { status: 400 };
      mockApi.patch = jest.fn().mockResolvedValue(mockResponse);
      mockUseAuthStore.getState = jest.fn(() => ({
        setUserName: jest.fn(),
      }));

      const result = await changeUsername('newusername');

      expect(result).toBe(false);
    });

    it('should throw error on API failure', async () => {
      const error = new Error('Username change failed');
      mockApi.patch = jest.fn().mockRejectedValue(error);
      jest.mocked(errorExtraction.extractErrorMessage).mockReturnValue('Username change failed');

      await expect(changeUsername('test')).rejects.toThrow('Username change failed');
    });

    it('should handle special characters in username', async () => {
      const mockResponse = { status: 200 };
      mockApi.patch = jest.fn().mockResolvedValue(mockResponse);
      mockUseAuthStore.getState = jest.fn(() => ({
        setUserName: jest.fn(),
      }));

      await changeUsername('user@name#123');

      expect(mockApi.patch).toHaveBeenCalledWith('/users/me', { username: 'user@name#123' });
    });
  });
});
