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

  describe('unblockUser', () => {
    it('should successfully unblock a user', async () => {
      const userId = '123';
      mockedApi.delete.mockResolvedValue({
        data: {
          message: 'Unblocked user successfully',
        },
      });

      const result = await profileService.unblockUser(userId);

      expect(mockedApi.delete).toHaveBeenCalledWith(`/users/${userId}/unblock`);
      expect(result).toEqual({
        message: 'Unblocked user successfully',
      });
    });

    it('should throw network error when unblock fails', async () => {
      mockedApi.delete.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.unblockUser('123')).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should throw error when user is not blocked', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'User is not blocked',
          },
        },
      });

      await expect(profileService.unblockUser('123')).rejects.toThrow('User is not blocked');
    });

    it('should throw generic error when unblocking fails without specific message', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {},
        },
      });

      await expect(profileService.unblockUser('123')).rejects.toThrow('An error occurred while unblocking user.');
    });
  });

  describe('getMutualFollowers', () => {
    it('should successfully fetch mutual followers', async () => {
      const mockResponse = {
        data: [
          { id: '1', username: 'user1', avatar: 'avatar1.jpg' },
          { id: '2', username: 'user2', avatar: 'avatar2.jpg' },
        ],
        nextCursor: 'cursor123',
      };

      mockedApi.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await profileService.getMutualFollowers({ userId: '123', following: true });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/followers', {
        params: {
          cursor: '',
          limit: 20,
          following: true,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination with cursor', async () => {
      const mockResponse = {
        data: [],
        nextCursor: null,
      };

      mockedApi.get.mockResolvedValue({
        data: mockResponse,
      });

      await profileService.getMutualFollowers({
        userId: '123',
        cursor: 'cursor456',
        limit: 10,
        following: true,
      });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/followers', {
        params: {
          cursor: 'cursor456',
          limit: 10,
          following: true,
        },
      });
    });

    it('should throw network error', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getMutualFollowers({ userId: '123' })).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });
  });

  describe('getMutedList', () => {
    it('should successfully fetch muted users list', async () => {
      const mockResponse = {
        data: [
          { id: '1', username: 'muted1' },
          { id: '2', username: 'muted2' },
        ],
        nextCursor: 'cursor789',
      };

      mockedApi.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await profileService.getMutedList({ userId: 'me' });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/muted', {
        params: {
          cursor: '',
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle custom pagination parameters', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: [], nextCursor: null },
      });

      await profileService.getMutedList({ userId: 'me', cursor: 'abc123', limit: 50 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/muted', {
        params: {
          cursor: 'abc123',
          limit: 50,
        },
      });
    });

    it('should throw error when fetching muted list fails', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized access',
          },
        },
      });

      await expect(profileService.getMutedList({ userId: 'me' })).rejects.toThrow('Unauthorized access');
    });
  });

  describe('getBlockedList', () => {
    it('should successfully fetch blocked users list', async () => {
      const mockResponse = {
        data: [
          { id: '1', username: 'blocked1' },
          { id: '2', username: 'blocked2' },
        ],
        nextCursor: 'cursor999',
      };

      mockedApi.get.mockResolvedValue({
        data: mockResponse,
      });

      const result = await profileService.getBlockedList({ userId: 'me' });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/blocked', {
        params: {
          cursor: '',
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: [], nextCursor: null },
      });

      await profileService.getBlockedList({ userId: 'me', cursor: 'xyz789', limit: 30 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/blocked', {
        params: {
          cursor: 'xyz789',
          limit: 30,
        },
      });
    });

    it('should throw network error', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getBlockedList({ userId: 'me' })).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });
  });

  describe('getUserPosts', () => {
    it('should successfully fetch user posts', async () => {
      const mockResponse = {
        posts: [
          { id: '1', content: 'Post 1' },
          { id: '2', content: 'Post 2' },
        ],
        nextCursor: 'post_cursor',
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.getUserPosts({ userId: '123', limit: 20 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/posts', {
        params: { limit: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include cursor when provided', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: { posts: [], nextCursor: null } },
      });

      await profileService.getUserPosts({ userId: '123', cursor: 'abc', limit: 10 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/posts', {
        params: { cursor: 'abc', limit: 10 },
      });
    });

    it('should throw error when fetching posts fails', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: { message: 'User posts not found' },
        },
      });

      await expect(profileService.getUserPosts({ userId: '999' })).rejects.toThrow('User posts not found');
    });
  });

  describe('getUserMedia', () => {
    it('should successfully fetch user media', async () => {
      const mockResponse = {
        media: [
          { id: '1', url: 'media1.jpg' },
          { id: '2', url: 'media2.jpg' },
        ],
        nextCursor: 'media_cursor',
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.getUserMedia({ userId: '123' });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/media', {
        params: { limit: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle pagination with cursor', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: { media: [], nextCursor: null } },
      });

      await profileService.getUserMedia({ userId: '123', cursor: 'xyz', limit: 15 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/media', {
        params: { cursor: 'xyz', limit: 15 },
      });
    });

    it('should throw network error', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getUserMedia({ userId: '123' })).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });
  });

  describe('getUserLikes', () => {
    it('should successfully fetch user likes', async () => {
      const mockResponse = {
        likes: [
          { id: '1', postId: 'post1' },
          { id: '2', postId: 'post2' },
        ],
        nextCursor: 'likes_cursor',
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.getUserLikes({ userId: '123' });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/liked-posts', {
        params: {
          cursor: '',
          limit: 20,
        },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should handle custom parameters', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: { likes: [], nextCursor: null } },
      });

      await profileService.getUserLikes({ userId: '123', cursor: 'def', limit: 25 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/liked-posts', {
        params: {
          cursor: 'def',
          limit: 25,
        },
      });
    });

    it('should throw error when fetching likes fails', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: { message: 'Likes not accessible' },
        },
      });

      await expect(profileService.getUserLikes({ userId: '123' })).rejects.toThrow('Likes not accessible');
    });
  });

  describe('getUserReplies', () => {
    it('should successfully fetch user replies', async () => {
      const mockResponse = {
        replies: [
          { id: '1', content: 'Reply 1' },
          { id: '2', content: 'Reply 2' },
        ],
        nextCursor: 'reply_cursor',
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.getUserReplies({ userId: '123' });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/replies', {
        params: { limit: 20 },
      });
      expect(result).toEqual(mockResponse);
    });

    it('should include cursor when provided', async () => {
      mockedApi.get.mockResolvedValue({
        data: { data: { replies: [], nextCursor: null } },
      });

      await profileService.getUserReplies({ userId: '123', cursor: 'ghi', limit: 30 });

      expect(mockedApi.get).toHaveBeenCalledWith('/users/123/replies', {
        params: { cursor: 'ghi', limit: 30 },
      });
    });

    it('should throw network error', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getUserReplies({ userId: '123' })).rejects.toThrow(
        'Network error. Please check your connection.',
      );
    });
  });

  describe('getUserRelations', () => {
    it('should successfully fetch user relations count', async () => {
      const mockResponse = {
        blockedCount: 5,
        mutedCount: 3,
      };

      mockedApi.get.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.getUserRelations();

      expect(mockedApi.get).toHaveBeenCalledWith('/users/me/relations-count');
      expect(result).toEqual(mockResponse);
    });

    it('should throw network error', async () => {
      mockedApi.get.mockRejectedValue({
        code: 'ERR_NETWORK',
      });

      await expect(profileService.getUserRelations()).rejects.toThrow('Network error. Please check your connection.');
    });

    it('should throw error when fetching relations fails', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: { message: 'Failed to fetch relations' },
        },
      });

      await expect(profileService.getUserRelations()).rejects.toThrow('Failed to fetch relations');
    });

    it('should throw generic error when no specific message', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {},
        },
      });

      await expect(profileService.getUserRelations()).rejects.toThrow(
        'An error occurred while fetching user relations.',
      );
    });
  });

  describe('uploadAvatar HEIC conversion', () => {
    it('should convert HEIC extension to JPG', async () => {
      const mockImageUri = 'file:///path/to/avatar.heic';
      const mockResponse = {
        imageUrl: 'https://azure.blob/avatar.jpg',
        imageName: 'avatar_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      await profileService.uploadAvatar(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalled();
      // FormData should have jpeg type
    });

    it('should convert HEIF extension to JPG', async () => {
      const mockImageUri = 'file:///path/to/avatar.heif';
      const mockResponse = {
        imageUrl: 'https://azure.blob/avatar.jpg',
        imageName: 'avatar_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      await profileService.uploadAvatar(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalled();
    });
  });

  describe('uploadCover HEIC conversion', () => {
    it('should convert HEIC extension to JPG for cover', async () => {
      const mockImageUri = 'file:///path/to/cover.HEIC';
      const mockResponse = {
        imageUrl: 'https://azure.blob/cover.jpg',
        imageName: 'cover_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      await profileService.uploadCover(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalled();
    });

    it('should handle cover with no file extension', async () => {
      const mockImageUri = 'file:///path/to/image';
      const mockResponse = {
        imageUrl: 'https://azure.blob/cover.jpg',
        imageName: 'cover_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      await profileService.uploadCover(mockImageUri);

      expect(mockedApi.post).toHaveBeenCalled();
    });
  });

  describe('muteUser', () => {
    it('should successfully mute a user', async () => {
      mockedApi.post.mockResolvedValue({
        data: { message: 'User muted successfully' },
      });

      const result = await profileService.muteUser('123');

      expect(mockedApi.post).toHaveBeenCalledWith('/users/123/mute');
      expect(result.message).toBe('User muted successfully');
    });

    it('should throw generic error when muting fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(customError);

      await expect(profileService.muteUser('123')).rejects.toThrow(customError);
    });

    it('should throw error from response when muting fails', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'Cannot mute yourself',
          },
        },
      });

      await expect(profileService.muteUser('123')).rejects.toThrow('Cannot mute yourself');
    });
  });

  describe('unmuteUser', () => {
    it('should throw generic error when unmuting fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.delete.mockRejectedValue(customError);

      await expect(profileService.unmuteUser('123')).rejects.toThrow(customError);
    });

    it('should throw error from response when unmuting fails', async () => {
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

  describe('followUser', () => {
    it('should throw generic error when following fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(customError);

      await expect(profileService.followUser('123')).rejects.toThrow(customError);
    });

    it('should throw error from response when following fails', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'Cannot follow private account',
          },
        },
      });

      await expect(profileService.followUser('123')).rejects.toThrow('Cannot follow private account');
    });
  });

  describe('unfollowUser', () => {
    it('should throw generic error when unfollowing fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.delete.mockRejectedValue(customError);

      await expect(profileService.unfollowUser('123')).rejects.toThrow(customError);
    });

    it('should throw error from response when unfollowing fails', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'Not following this user',
          },
        },
      });

      await expect(profileService.unfollowUser('123')).rejects.toThrow('Not following this user');
    });
  });

  describe('blockUser', () => {
    it('should throw generic error when blocking fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(customError);

      await expect(profileService.blockUser('123')).rejects.toThrow(customError);
    });

    it('should throw error from response when blocking fails', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'Cannot block yourself',
          },
        },
      });

      await expect(profileService.blockUser('123')).rejects.toThrow('Cannot block yourself');
    });
  });

  describe('unblockUser - additional coverage', () => {
    it('should throw generic error when unblocking fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.delete.mockRejectedValue(customError);

      await expect(profileService.unblockUser('123')).rejects.toThrow(customError);
    });
  });

  describe('getFollowersList - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getFollowersList({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getFollowersList({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('getFollowingList - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getFollowingList({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getFollowingList({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('getMutedList - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getMutedList({ userId: 'me' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      });

      await expect(profileService.getMutedList({ userId: 'me' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getBlockedList - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getBlockedList({ userId: 'me' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      });

      await expect(profileService.getBlockedList({ userId: 'me' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getMutualFollowers - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getMutualFollowers({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getMutualFollowers({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('uploadAvatar - additional coverage', () => {
    it('should throw generic error when uploading fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(customError);

      await expect(profileService.uploadAvatar('file:///path/to/image.jpg')).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'File too large',
          },
        },
      });

      await expect(profileService.uploadAvatar('file:///path/to/image.jpg')).rejects.toThrow('File too large');
    });

    it('should handle image without extension', async () => {
      const mockImageUri = 'file:///path/to/image';
      const mockResponse = {
        imageUrl: 'https://azure.blob/avatar.jpg',
        imageName: 'avatar_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.uploadAvatar(mockImageUri);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('uploadCover - additional coverage', () => {
    it('should throw generic error when uploading fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.post.mockRejectedValue(customError);

      await expect(profileService.uploadCover('file:///path/to/image.jpg')).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.post.mockRejectedValue({
        response: {
          data: {
            message: 'File too large',
          },
        },
      });

      await expect(profileService.uploadCover('file:///path/to/image.jpg')).rejects.toThrow('File too large');
    });

    it('should handle cover image without extension', async () => {
      const mockImageUri = 'file:///path/to/cover';
      const mockResponse = {
        imageUrl: 'https://azure.blob/cover.jpg',
        imageName: 'cover_123.jpg',
      };

      mockedApi.post.mockResolvedValue({
        data: { data: mockResponse },
      });

      const result = await profileService.uploadCover(mockImageUri);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteAvatar - additional coverage', () => {
    it('should throw generic error when deleting fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.delete.mockRejectedValue(customError);

      await expect(profileService.deleteAvatar('https://example.com/avatar.jpg')).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'Avatar not found',
          },
        },
      });

      await expect(profileService.deleteAvatar('https://example.com/avatar.jpg')).rejects.toThrow('Avatar not found');
    });
  });

  describe('deleteCover - additional coverage', () => {
    it('should throw generic error when deleting fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.delete.mockRejectedValue(customError);

      await expect(profileService.deleteCover('https://example.com/cover.jpg')).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.delete.mockRejectedValue({
        response: {
          data: {
            message: 'Cover not found',
          },
        },
      });

      await expect(profileService.deleteCover('https://example.com/cover.jpg')).rejects.toThrow('Cover not found');
    });
  });

  describe('getUserPosts - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getUserPosts({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getUserPosts({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('getUserMedia - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getUserMedia({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getUserMedia({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('getUserLikes - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getUserLikes({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      });

      await expect(profileService.getUserLikes({ userId: '123' })).rejects.toThrow('Unauthorized');
    });
  });

  describe('getUserReplies - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getUserReplies({ userId: '123' })).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'User not found',
          },
        },
      });

      await expect(profileService.getUserReplies({ userId: '123' })).rejects.toThrow('User not found');
    });
  });

  describe('getUserRelations - additional coverage', () => {
    it('should throw generic error when fetching fails without response', async () => {
      const customError = new Error('Unknown error');
      mockedApi.get.mockRejectedValue(customError);

      await expect(profileService.getUserRelations()).rejects.toThrow(customError);
    });

    it('should throw error from response data', async () => {
      mockedApi.get.mockRejectedValue({
        response: {
          data: {
            message: 'Unauthorized',
          },
        },
      });

      await expect(profileService.getUserRelations()).rejects.toThrow('Unauthorized');
    });
  });
});
