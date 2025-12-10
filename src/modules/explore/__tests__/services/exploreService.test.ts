import api from '@/src/services/apiClient';
import * as exploreService from '../../services/exploreService';

// Mock the api client
jest.mock('@/src/services/apiClient', () => ({
  get: jest.fn(),
}));

describe('exploreService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrends', () => {
    it('should fetch trends without category', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ hashtag: '#test', postsCount: 100, category: 'general' }],
          },
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getTrends();

      expect(api.get).toHaveBeenCalledWith('/trend', { params: undefined });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch trends with category filter', async () => {
      const mockResponse = {
        data: {
          data: {
            data: [{ hashtag: '#sports', postsCount: 50, category: 'sports' }],
          },
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getTrends('sports');

      expect(api.get).toHaveBeenCalledWith('/trend', { params: { category: 'sports' } });
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getExploreData', () => {
    it('should fetch explore data', async () => {
      const mockResponse = {
        data: {
          data: {
            trending: { data: [] },
            whoToFollow: [],
            forYou: [],
          },
          count: 0,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getExploreData();

      expect(api.get).toHaveBeenCalledWith('/explore');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getWhoToFollow', () => {
    it('should fetch who to follow suggestions', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              id: '1',
              username: 'user1',
              name: 'User One',
              bio: 'Bio',
              avatarUrl: 'https://example.com/avatar.jpg',
              verified: false,
              followers: 100,
              following: 50,
              isFollowing: false,
              isFollowed: false,
            },
          ],
          count: 1,
          message: 'Success',
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getWhoToFollow();

      expect(api.get).toHaveBeenCalledWith('/explore/who-to-follow');
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getCategoryTweets', () => {
    it('should fetch category tweets with default pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            category: { id: '1', name: 'Sports' },
            tweets: [],
            pagination: { page: 1, hasMore: false },
            message: 'Success',
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getCategoryTweets('1');

      expect(api.get).toHaveBeenCalledWith('/explore/category/1', {
        params: { page: 1, limit: 10, category_id: '1' },
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should fetch category tweets with custom pagination', async () => {
      const mockResponse = {
        data: {
          data: {
            category: { id: '2', name: 'News' },
            tweets: [],
            pagination: { page: 2, hasMore: true },
            message: 'Success',
          },
        },
      };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await exploreService.getCategoryTweets('2', 2, 20);

      expect(api.get).toHaveBeenCalledWith('/explore/category/2', {
        params: { page: 2, limit: 20, category_id: '2' },
      });
      expect(result).toEqual(mockResponse.data);
    });
  });
});
