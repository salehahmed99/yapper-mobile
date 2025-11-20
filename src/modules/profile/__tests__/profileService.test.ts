import api from '@/src/services/apiClient';
import * as profileService from '../services/profileService';

// Mock the API client
jest.mock('@/src/services/apiClient');

const mockedApi = api as jest.Mocked<typeof api>;

describe('Profile Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getMyUser', () => {
    it('should successfully fetch current user data', async () => {
      const mockUserData = {
        userId: '123',
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        bio: 'Software Developer',
        avatarUrl: 'https://example.com/avatar.jpg',
        coverUrl: 'https://example.com/cover.jpg',
      };

      mockedApi.get.mockResolvedValue({
        data: {
          data: mockUserData,
          message: 'Success',
        },
      });

      const result = await profileService.getMyUser();

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me');
      expect(result).toEqual(mockUserData);
    });

    it('should throw network error when network fails', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getMyUser()).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should throw API error when server returns error', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getMyUser()).rejects.toThrow('User not found');
    });

    it('should throw generic error when no specific error message', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {},
        },
      });

      await expect(profileService.getMyUser()).rejects.toThrow('An error occurred while fetching user data.');
    });
  });

  describe('getUserById', () => {
    it('should successfully fetch user by ID', async () => {
      const mockUserData = {
        userId: '456',
        name: 'Jane Doe',
        username: 'janedoe',
        email: 'jane@example.com',
      };

      mockedApi.get.mockResolvedValue({
        data: {
          data: mockUserData,
          message: 'Success',
        },
      });

      const result = await profileService.getUserById('456');

      expect(mockedApi.get).toHaveBeenCalledWith('/users/456');
      expect(result).toEqual(mockUserData);
    });

    it('should throw network error when network fails', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getUserById('456')).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should throw error when user not found', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User does not exist',
          },
        },
      });

      await expect(profileService.getUserById('999')).rejects.toThrow('User does not exist');
    });
  });

  describe('updateUserProfile', () => {
    it('should successfully update user profile with all fields', async () => {
      const updateData = {
        name: 'Updated Name',
        bio: 'Updated Bio',
        country: 'USA',
        website: 'https://example.com',
        birthDate: '1990-01-01',
        avatar_url: 'https://example.com/avatar.jpg',
        cover_url: 'https://example.com/cover.jpg',
      };

      mockedApi.patch.mockResolvedValue({
        data: {
          message: 'Updated user successfully',
        },
      });

      const result = await profileService.updateUserProfile(updateData);

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual({ message: 'Updated user successfully' });
    });

    it('should successfully update user profile with partial fields', async () => {
      const updateData = {
        name: 'New Name',
      };

      mockedApi.patch.mockResolvedValue({
        data: {
          message: 'Updated user successfully',
        },
      });

      const result = await profileService.updateUserProfile(updateData);

      expect(mockedApi.patch).toHaveBeenCalledWith('/users/me', updateData);
      expect(result).toEqual({ message: 'Updated user successfully' });
    });

    it('should throw network error when network fails', async () => {
      mockedApi.patch.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.updateUserProfile({ name: 'Test' })).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });

    it('should throw error when update fails', async () => {
      mockedApi.patch.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid data',
          },
        },
      });

      await expect(profileService.updateUserProfile({ name: '' })).rejects.toThrow('Invalid data');
    });
  });

  describe('uploadAvatar', () => {
    it('should successfully upload avatar image', async () => {
      const mockImageUri = 'file:///path/to/avatar.jpg';
      const mockResponse = {
        imageUrl: 'https://azure.blob/avatar.jpg',
        imageName: 'avatar_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: {
          data: mockResponse,
        },
      });

      const result = await profileService.uploadAvatar(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/users/me/upload-avatar',
        expect.any(Object), // FormData
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should handle avatar upload with png extension', async () => {
      const mockImageUri = 'file:///path/to/avatar.png';
      const mockResponse = {
        imageUrl: 'https://azure.blob/avatar.png',
        imageName: 'avatar_123.png',
      };

      mockedApi.post.mockResolvedValue({
        data: {
          data: mockResponse,
        },
      });

      await profileService.uploadAvatar(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalled();
    });

    it('should throw network error when upload fails due to network', async () => {
      mockedApi.post.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.uploadAvatar('file:///avatar.jpg')).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });

    it('should throw error when file is invalid', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'File not found',
          },
        },
      });

      await expect(profileService.uploadAvatar('invalid://path')).rejects.toThrow('File not found');
    });

    it('should throw error when file size exceeds limit', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'File size exceeds maximum limit',
          },
        },
      });

      await expect(profileService.uploadAvatar('file:///large-file.jpg')).rejects.toThrow(
        'File size exceeds maximum limit',
      );
    });
  });

  describe('uploadCover', () => {
    it('should successfully upload cover image', async () => {
      const mockImageUri = 'file:///path/to/cover.jpg';
      const mockResponse = {
        imageUrl: 'https://azure.blob/cover.jpg',
        imageName: 'cover_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: {
          data: mockResponse,
        },
      });

      const result = await profileService.uploadCover(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalledWith(
        '/users/me/upload-cover',
        expect.any(Object), // FormData
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        },
      );
      expect(result).toEqual(mockResponse);
    });

    it('should throw network error when upload fails due to network', async () => {
      mockedApi.post.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.uploadCover('file:///cover.jpg')).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });

    it('should throw error when file format is invalid', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'Invalid file format',
          },
        },
      });

      await expect(profileService.uploadCover('file:///cover.pdf')).rejects.toThrow('Invalid file format');
    });
  });

  describe('deleteAvatar', () => {
    it('should successfully delete avatar', async () => {
      const fileUrl = 'https://azure.blob/avatar.jpg';

      mockedApi.delete.mockResolvedValue({
        data: {
          message: 'Avatar deleted successfully',
        },
      });

      await profileService.deleteAvatar(fileUrl);

      expect(mockedApi.delete).toHaveBeenCalledWith('/users/me/delete-avatar', {
        data: {
          file_url: fileUrl,
        },
      });
    });

    it('should throw network error when delete fails due to network', async () => {
      mockedApi.delete.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.deleteAvatar('https://azure.blob/avatar.jpg')).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });

    it('should throw error when file not found', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'File not found',
          },
        },
      });

      await expect(profileService.deleteAvatar('https://azure.blob/nonexistent.jpg')).rejects.toThrow('File not found');
    });

    it('should throw generic error when deleting avatar fails without specific message', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {},
        },
      });

      await expect(profileService.deleteAvatar('https://azure.blob/avatar.jpg')).rejects.toThrow(
        'An error occurred while deleting avatar.',
      );
    });
  });

  describe('deleteCover', () => {
    it('should successfully delete cover', async () => {
      const fileUrl = 'https://azure.blob/cover.jpg';

      mockedApi.delete.mockResolvedValue({
        data: {
          message: 'Cover deleted successfully',
        },
      });

      await profileService.deleteCover(fileUrl);

      expect(mockedApi.delete).toHaveBeenCalledWith('/users/me/delete-cover', {
        data: {
          file_url: fileUrl,
        },
      });
    });

    it('should throw network error when delete fails due to network', async () => {
      mockedApi.delete.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.deleteCover('https://azure.blob/cover.jpg')).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });

    it('should throw error when unauthorized to delete', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      });

      await expect(profileService.deleteCover('https://azure.blob/cover.jpg')).rejects.toThrow('Unauthorized');
    });

    it('should throw generic error when deleting cover fails without specific message', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {},
        },
      });

      await expect(profileService.deleteCover('https://azure.blob/cover.jpg')).rejects.toThrow(
        'An error occurred while deleting cover.',
      );
    });
  });

  describe('followUser', () => {
    it('should successfully follow a user', async () => {
      const userId = '123';
      mockedApi.post.mockResolvedValue({
        data: {
          count: 101,
          message: 'Followed user successfully',
        },
      });

      const result = await profileService.followUser(userId);

      expect(mockedApi.post).toHaveBeenCalledWith(`/users/${userId}/follow`);
      expect(result).toEqual({
        count: 101,
        message: 'Followed user successfully',
      });
    });

    it('should throw error when trying to follow yourself', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'Cannot follow yourself',
          },
        },
      });

      await expect(profileService.followUser('123')).rejects.toThrow('Cannot follow yourself');
    });
  });

  describe('unfollowUser', () => {
    it('should successfully unfollow a user', async () => {
      const userId = '123';
      mockedApi.delete.mockResolvedValue({
        data: {
          message: 'Unfollowed user successfully',
        },
      });

      const result = await profileService.unfollowUser(userId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/users/${userId}/unfollow`);
      expect(result).toEqual({
        message: 'Unfollowed user successfully',
      });
    });

    it('should throw error when user is not followed', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'You are not following this user',
          },
        },
      });

      await expect(profileService.unfollowUser('123')).rejects.toThrow('You are not following this user');
    });
  });

  describe('muteUser', () => {
    it('should successfully mute a user', async () => {
      const userId = '123';
      mockedApi.post.mockResolvedValue({
        data: {
          message: 'User muted successfully',
        },
      });

      const result = await profileService.muteUser(userId);

      expect(mockedApi.post).toHaveBeenCalledWith(`/users/${userId}/mute`);
      expect(result).toEqual({
        message: 'User muted successfully',
      });
    });

    it('should throw network error when mute fails', async () => {
      mockedApi.post.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.muteUser('123')).rejects.toThrow('Network error. Please check your connection.');
    });
  });

  describe('unmuteUser', () => {
    it('should successfully unmute a user', async () => {
      const userId = '123';
      mockedApi.delete.mockResolvedValue({
        data: {
          message: 'User unmuted successfully',
        },
      });

      const result = await profileService.unmuteUser(userId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/users/${userId}/unmute`);
      expect(result).toEqual({
        message: 'User unmuted successfully',
      });
    });

    it('should throw error when user is not muted', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'User is not muted',
          },
        },
      });

      await expect(profileService.unmuteUser('123')).rejects.toThrow('User is not muted');
    });
  });

  describe('blockUser', () => {
    it('should successfully block a user', async () => {
      const userId = '123';
      mockedApi.post.mockResolvedValue({
        data: {
          message: 'Blocked user successfully',
        },
      });

      const result = await profileService.blockUser(userId);

      expect(mockedApi.post).toHaveBeenCalledWith(`/users/${userId}/block`);
      expect(result).toEqual({
        message: 'Blocked user successfully',
      });
    });

    it('should throw network error when block fails', async () => {
      mockedApi.post.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.blockUser('123')).rejects.toThrow('Network error. Please check your connection.');
    });
  });
});
