import api from '@/src/services/apiClient';
import { followUser, unfollowUser } from '../../services/profileService';

// Mock the api client
jest.mock('@/src/services/apiClient');

describe('profileService - Follow/Unfollow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      const mockUserId = 'user-123';
      const mockResponse = {
        data: {
          count: 1,
          message: 'Followed user successfully',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await followUser(mockUserId);

      expect(api.post).toHaveBeenCalledWith(`/users/${mockUserId}/follow`);
      expect(result).toEqual({
        count: 1,
        message: 'Followed user successfully',
      });
    });

    it('should return default count when not provided', async () => {
      const mockUserId = 'user-456';
      const mockResponse = {
        data: {
          message: 'Followed user successfully',
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await followUser(mockUserId);

      expect(result.count).toBe(0);
      expect(result.message).toBe('Followed user successfully');
    });

    it('should return default message when not provided', async () => {
      const mockUserId = 'user-789';
      const mockResponse = {
        data: {
          count: 5,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await followUser(mockUserId);

      expect(result.count).toBe(5);
      expect(result.message).toBe('Followed user successfully');
    });

    it('should handle network errors', async () => {
      const mockUserId = 'user-error';
      const networkError = new Error('Network error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (networkError as any).code = 'ERR_NETWORK';

      (api.post as jest.Mock).mockRejectedValue(networkError);

      await expect(followUser(mockUserId)).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should handle API error responses', async () => {
      const mockUserId = 'user-error';
      const apiError = {
        response: {
          data: {
            message: 'User not found',
          },
        },
      };

      (api.post as jest.Mock).mockRejectedValue(apiError);

      await expect(followUser(mockUserId)).rejects.toThrow('User not found');
    });

    it('should handle API error responses without message', async () => {
      const mockUserId = 'user-error';
      const apiError = {
        response: {
          data: {},
        },
      };

      (api.post as jest.Mock).mockRejectedValue(apiError);

      await expect(followUser(mockUserId)).rejects.toThrow('An error occurred while following user.');
    });

    it('should handle unknown errors', async () => {
      const mockUserId = 'user-error';
      const unknownError = new Error('Unknown error');

      (api.post as jest.Mock).mockRejectedValue(unknownError);

      await expect(followUser(mockUserId)).rejects.toThrow('Unknown error');
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      const mockUserId = 'user-123';
      const mockResponse = {
        data: {
          message: 'Unfollowed user successfully',
        },
      };

      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await unfollowUser(mockUserId);

      expect(api.delete).toHaveBeenCalledWith(`/users/${mockUserId}/unfollow`);
      expect(result).toEqual({
        message: 'Unfollowed user successfully',
      });
    });

    it('should return default message when not provided', async () => {
      const mockUserId = 'user-456';
      const mockResponse = {
        data: {},
      };

      (api.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await unfollowUser(mockUserId);

      expect(result.message).toBe('Unfollowed user successfully');
    });

    it('should handle network errors', async () => {
      const mockUserId = 'user-error';
      const networkError = new Error('Network error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (networkError as any).code = 'ERR_NETWORK';

      (api.delete as jest.Mock).mockRejectedValue(networkError);

      await expect(unfollowUser(mockUserId)).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should handle API error responses', async () => {
      const mockUserId = 'user-error';
      const apiError = {
        response: {
          data: {
            message: 'Cannot unfollow user',
          },
        },
      };

      (api.delete as jest.Mock).mockRejectedValue(apiError);

      await expect(unfollowUser(mockUserId)).rejects.toThrow('Cannot unfollow user');
    });

    it('should handle API error responses without message', async () => {
      const mockUserId = 'user-error';
      const apiError = {
        response: {
          data: {},
        },
      };

      (api.delete as jest.Mock).mockRejectedValue(apiError);

      await expect(unfollowUser(mockUserId)).rejects.toThrow('An error occurred while unfollowing user.');
    });

    it('should handle unknown errors', async () => {
      const mockUserId = 'user-error';
      const unknownError = new Error('Unknown error');

      (api.delete as jest.Mock).mockRejectedValue(unknownError);

      await expect(unfollowUser(mockUserId)).rejects.toThrow('Unknown error');
    });
  });
});
