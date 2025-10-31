import api from '@/src/services/apiClient';
import { blockUser, unblockUser } from '../../services/profileService';

// Mock the API client
jest.mock('@/src/services/apiClient');

const mockedApi = api as jest.Mocked<typeof api>;

describe('profileService - Block/Unblock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('blockUser', () => {
    it('should successfully block a user', async () => {
      const mockResponse = {
        data: {
          data: {},
          count: 0,
          message: 'Blocked user successfully',
        },
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await blockUser('user123');

      expect(mockedApi.post).toHaveBeenCalledWith('/users/user123/block');
      expect(result).toEqual({
        message: 'Blocked user successfully',
      });
    });

    it('should return default message when not provided', async () => {
      const mockResponse = {
        data: {},
      };

      mockedApi.post.mockResolvedValueOnce(mockResponse);

      const result = await blockUser('user123');

      expect(result.message).toBe('Blocked user successfully');
    });

    it('should handle network errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const networkError: any = new Error('Network Error');
      networkError.code = 'ERR_NETWORK';

      mockedApi.post.mockRejectedValueOnce(networkError);

      await expect(blockUser('user123')).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should handle API error responses', async () => {
      const apiError = {
        response: {
          data: {
            message: 'User not found',
          },
        },
      };

      mockedApi.post.mockRejectedValueOnce(apiError);

      await expect(blockUser('user123')).rejects.toThrow('User not found');
    });

    it('should handle API error responses without message', async () => {
      const apiError = {
        response: {
          data: {},
        },
      };

      mockedApi.post.mockRejectedValueOnce(apiError);

      await expect(blockUser('user123')).rejects.toThrow('An error occurred while blocking user.');
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error');

      mockedApi.post.mockRejectedValueOnce(unknownError);

      await expect(blockUser('user123')).rejects.toThrow('Unknown error');
    });
  });

  describe('unblockUser', () => {
    it('should successfully unblock a user', async () => {
      const mockResponse = {
        data: {
          data: {},
          count: 0,
          message: 'Unblocked user successfully',
        },
      };

      mockedApi.delete.mockResolvedValueOnce(mockResponse);

      const result = await unblockUser('user123');

      expect(mockedApi.delete).toHaveBeenCalledWith('/users/user123/unblock');
      expect(result).toEqual({
        message: 'Unblocked user successfully',
      });
    });

    it('should return default message when not provided', async () => {
      const mockResponse = {
        data: {},
      };

      mockedApi.delete.mockResolvedValueOnce(mockResponse);

      const result = await unblockUser('user123');

      expect(result.message).toBe('Unblocked user successfully');
    });

    it('should handle network errors', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const networkError: any = new Error('Network Error');
      networkError.code = 'ERR_NETWORK';

      mockedApi.delete.mockRejectedValueOnce(networkError);

      await expect(unblockUser('user123')).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should handle API error responses', async () => {
      const apiError = {
        response: {
          data: {
            message: 'User not found',
          },
        },
      };

      mockedApi.delete.mockRejectedValueOnce(apiError);

      await expect(unblockUser('user123')).rejects.toThrow('User not found');
    });

    it('should handle API error responses without message', async () => {
      const apiError = {
        response: {
          data: {},
        },
      };

      mockedApi.delete.mockRejectedValueOnce(apiError);

      await expect(unblockUser('user123')).rejects.toThrow('An error occurred while unblocking user.');
    });

    it('should handle unknown errors', async () => {
      const unknownError = new Error('Unknown error');

      mockedApi.delete.mockRejectedValueOnce(unknownError);

      await expect(unblockUser('user123')).rejects.toThrow('Unknown error');
    });
  });
});
