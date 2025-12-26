import api from '@/src/services/apiClient';
import * as searchService from '../../services/searchService';

// Mock the api client
jest.mock('@/src/services/apiClient', () => ({
  get: jest.fn(),
}));

describe('searchService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSearchSuggestions', () => {
    it('should fetch suggestions without username', async () => {
      const mockResponse = {
        data: {
          data: {
            suggestedQueries: [{ query: 'test', isTrending: true }],
            suggestedUsers: [],
          },
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.getSearchSuggestions({ query: 'test' });

      expect(api.get).toHaveBeenCalledWith('/search/suggestions', {
        params: { query: 'test' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch suggestions with username filter', async () => {
      const mockResponse = {
        data: {
          data: {
            suggestedQueries: [],
            suggestedUsers: [
              { userId: '1', name: 'User', username: 'user', avatarUrl: null, isFollowing: false, isFollower: false },
            ],
          },
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.getSearchSuggestions({ query: 'user', username: 'fromuser' });

      expect(api.get).toHaveBeenCalledWith('/search/suggestions', {
        params: { query: 'user', username: 'fromuser' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('searchPosts', () => {
    it('should search posts with minimal params', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: { nextCursor: null, hasMore: false },
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchPosts({ query: 'react native' });

      expect(api.get).toHaveBeenCalledWith('/search/posts', {
        params: { query: 'react native' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search posts with all params', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: { nextCursor: 'cursor123', hasMore: true },
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchPosts({
        query: 'test',
        username: 'user',
        cursor: 'cursor',
        limit: 10,
        hasMedia: true,
      });

      expect(api.get).toHaveBeenCalledWith('/search/posts', {
        params: { query: 'test', username: 'user', cursor: 'cursor', limit: 10, hasMedia: true },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('searchLatestPosts', () => {
    it('should search latest posts', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: { nextCursor: null, hasMore: false },
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchLatestPosts({ query: 'latest news' });

      expect(api.get).toHaveBeenCalledWith('/search/posts/latest', {
        params: { query: 'latest news' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search latest posts with pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: { nextCursor: 'next', hasMore: true },
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchLatestPosts({
        query: 'test',
        username: 'user',
        cursor: 'prev',
        limit: 20,
      });

      expect(api.get).toHaveBeenCalledWith('/search/posts/latest', {
        params: { query: 'test', username: 'user', cursor: 'prev', limit: 20 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('searchUsers', () => {
    it('should search users with minimal params', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [],
            pagination: { nextCursor: null, hasMore: false },
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchUsers({ query: 'john' });

      expect(api.get).toHaveBeenCalledWith('/search/users', {
        params: { query: 'john' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should search users with all params', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [
              {
                userId: '1',
                name: 'John',
                username: 'john',
                bio: 'Developer',
                avatarUrl: null,
                coverUrl: null,
                verified: true,
                followers: 100,
                following: 50,
                isFollowing: false,
                isFollower: true,
                isMuted: false,
                isBlocked: false,
              },
            ],
            pagination: { nextCursor: 'cursor', hasMore: true },
          },
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await searchService.searchUsers({
        query: 'john',
        username: 'from',
        cursor: 'prev',
        limit: 15,
      });

      expect(api.get).toHaveBeenCalledWith('/search/users', {
        params: { query: 'john', username: 'from', cursor: 'prev', limit: 15 },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
