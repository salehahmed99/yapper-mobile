import {
  getForYou,
  getTweetById,
  likeTweet,
  repostTweet,
  undoRepostTweet,
  unlikeTweet,
} from '@/src/modules/tweets/services/tweetService';
import { ITweet } from '@/src/modules/tweets/types';
import api from '@/src/services/apiClient';

// Mock the API client
jest.mock('@/src/services/apiClient');
const mockedApi = api as jest.Mocked<typeof api>;

const mockTweet: ITweet = {
  tweet_id: 'tweet-1',
  type: 'tweet',
  content: 'Test tweet content',
  images: [],
  videos: [],
  likes_count: 10,
  reposts_count: 5,
  views_count: 100,
  quotes_count: 2,
  replies_count: 3,
  is_liked: false,
  is_reposted: false,
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
  user: {
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    username: 'testuser',
    avatar_url: undefined,
    verified: false,
  },
};

describe('tweetService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getForYou', () => {
    it('should fetch for you timeline tweets successfully', async () => {
      const mockResponse = {
        data: {
          data: {
            tweets: [mockTweet],
            count: 1,
            message: 'Success',
          },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getForYou({ limit: 10 });

      expect(mockedApi.get).toHaveBeenCalledWith('/timeline/for-you', {
        params: { limit: 10 },
      });
      expect(result).toEqual([mockTweet]);
    });

    it('should pass filters as query parameters', async () => {
      const mockResponse = {
        data: {
          data: {
            tweets: [],
            count: 0,
            message: 'Success',
          },
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      await getForYou({ user_id: 'user-1', cursor: 'abc123', limit: 20 });

      expect(mockedApi.get).toHaveBeenCalledWith('/timeline/for-you', {
        params: { user_id: 'user-1', cursor: 'abc123', limit: 20 },
      });
    });

    it('should handle API errors', async () => {
      const error = new Error('Network error');
      mockedApi.get.mockRejectedValue(error);

      await expect(getForYou({ limit: 10 })).rejects.toThrow('Network error');
    });
  });

  describe('getTweetById', () => {
    it('should fetch a single tweet by ID successfully', async () => {
      const mockResponse = {
        data: {
          data: mockTweet,
          count: 1,
          message: 'Success',
        },
      };

      mockedApi.get.mockResolvedValue(mockResponse);

      const result = await getTweetById('tweet-1');

      expect(mockedApi.get).toHaveBeenCalledWith('/tweets/tweet-1');
      expect(result).toEqual(mockTweet);
    });

    it('should handle tweet not found', async () => {
      const error = new Error('Tweet not found');
      mockedApi.get.mockRejectedValue(error);

      await expect(getTweetById('invalid-id')).rejects.toThrow('Tweet not found');
    });
  });

  describe('likeTweet', () => {
    it('should like a tweet successfully', async () => {
      mockedApi.post.mockResolvedValue({ data: {} });

      await likeTweet('tweet-1');

      expect(mockedApi.post).toHaveBeenCalledWith('/tweets/tweet-1/like');
    });

    it('should handle like errors', async () => {
      const error = new Error('Already liked');
      mockedApi.post.mockRejectedValue(error);

      await expect(likeTweet('tweet-1')).rejects.toThrow('Already liked');
    });
  });

  describe('unlikeTweet', () => {
    it('should unlike a tweet successfully', async () => {
      mockedApi.delete.mockResolvedValue({ data: {} });

      await unlikeTweet('tweet-1');

      expect(mockedApi.delete).toHaveBeenCalledWith('/tweets/tweet-1/like');
    });

    it('should handle unlike errors', async () => {
      const error = new Error('Not liked yet');
      mockedApi.delete.mockRejectedValue(error);

      await expect(unlikeTweet('tweet-1')).rejects.toThrow('Not liked yet');
    });
  });

  describe('repostTweet', () => {
    it('should repost a tweet successfully', async () => {
      mockedApi.post.mockResolvedValue({ data: {} });

      await repostTweet('tweet-1');

      expect(mockedApi.post).toHaveBeenCalledWith('/tweets/tweet-1/repost');
    });

    it('should handle repost errors', async () => {
      const error = new Error('Already reposted');
      mockedApi.post.mockRejectedValue(error);

      await expect(repostTweet('tweet-1')).rejects.toThrow('Already reposted');
    });
  });

  describe('undoRepostTweet', () => {
    it('should undo repost successfully', async () => {
      mockedApi.delete.mockResolvedValue({ data: {} });

      await undoRepostTweet('tweet-1');

      expect(mockedApi.delete).toHaveBeenCalledWith('/tweets/tweet-1/repost');
    });

    it('should handle undo repost errors', async () => {
      const error = new Error('Not reposted yet');
      mockedApi.delete.mockRejectedValue(error);

      await expect(undoRepostTweet('tweet-1')).rejects.toThrow('Not reposted yet');
    });
  });

  describe('Multiple operations', () => {
    it('should handle like and unlike in sequence', async () => {
      mockedApi.post.mockResolvedValue({ data: {} });
      mockedApi.delete.mockResolvedValue({ data: {} });

      await likeTweet('tweet-1');
      await unlikeTweet('tweet-1');

      expect(mockedApi.post).toHaveBeenCalledWith('/tweets/tweet-1/like');
      expect(mockedApi.delete).toHaveBeenCalledWith('/tweets/tweet-1/like');
    });

    it('should handle repost and undo in sequence', async () => {
      mockedApi.post.mockResolvedValue({ data: {} });
      mockedApi.delete.mockResolvedValue({ data: {} });

      await repostTweet('tweet-1');
      await undoRepostTweet('tweet-1');

      expect(mockedApi.post).toHaveBeenCalledWith('/tweets/tweet-1/repost');
      expect(mockedApi.delete).toHaveBeenCalledWith('/tweets/tweet-1/repost');
    });
  });
});
