import api from '@/src/services/apiClient';
import * as tweetService from '../../services/tweetService';

// Mock the api client
jest.mock('@/src/services/apiClient', () => ({
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
}));

describe('tweetService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('uploadImage', () => {
    it('should upload an image and return the url', async () => {
      const mockResponse = {
        data: {
          data: {
            url: 'http://example.com/image.jpg',
          },
        },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.uploadImage('file:///path/to/image.jpg');

      expect(api.post).toHaveBeenCalledWith(
        '/tweets/upload/image',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      expect(result).toBe('http://example.com/image.jpg');
    });
  });

  describe('uploadVideo', () => {
    it('should upload a video and return the url', async () => {
      const mockResponse = {
        data: {
          data: {
            url: 'http://example.com/video.mp4',
          },
        },
      };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.uploadVideo('file:///path/to/video.mp4');

      expect(api.post).toHaveBeenCalledWith(
        '/tweets/upload/video',
        expect.any(FormData),
        expect.objectContaining({
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
      expect(result).toBe('http://example.com/video.mp4');
    });
  });

  describe('uploadMediaFiles', () => {
    it('should upload multiple media files and separate images and videos', async () => {
      const mockImageResponse = {
        data: { data: { url: 'http://example.com/image.jpg' } },
      };
      const mockVideoResponse = {
        data: { data: { url: 'http://example.com/video.mp4' } },
      };

      (api.post as jest.Mock).mockImplementation((url) => {
        if (url === '/tweets/upload/image') return Promise.resolve(mockImageResponse);
        if (url === '/tweets/upload/video') return Promise.resolve(mockVideoResponse);
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await tweetService.uploadMediaFiles(['file:///path/to/image.jpg', 'file:///path/to/video.mp4']);

      expect(result).toEqual({
        images: ['http://example.com/image.jpg'],
        videos: ['http://example.com/video.mp4'],
      });
    });
  });

  describe('getForYou', () => {
    it('should fetch for-you timeline', async () => {
      const mockResponse = { data: { data: { tweets: [], nextCursor: null } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.getForYou({ limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/timeline/for-you', { params: { limit: 10 } });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getFollowing', () => {
    it('should fetch following timeline', async () => {
      const mockResponse = { data: { data: { tweets: [], nextCursor: null } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.getFollowing({ limit: 10 });

      expect(api.get).toHaveBeenCalledWith('/timeline/following', { params: { limit: 10 } });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getTweetById', () => {
    it('should fetch a single tweet', async () => {
      const mockResponse = { data: { data: { id: '1', content: 'test' } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.getTweetById('1');

      expect(api.get).toHaveBeenCalledWith('/tweets/1');
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('likeTweet', () => {
    it('should like a tweet', async () => {
      (api.post as jest.Mock).mockResolvedValue({});
      await tweetService.likeTweet('1');
      expect(api.post).toHaveBeenCalledWith('/tweets/1/like');
    });
  });

  describe('unlikeTweet', () => {
    it('should unlike a tweet', async () => {
      (api.delete as jest.Mock).mockResolvedValue({});
      await tweetService.unlikeTweet('1');
      expect(api.delete).toHaveBeenCalledWith('/tweets/1/like');
    });
  });

  describe('repostTweet', () => {
    it('should repost a tweet', async () => {
      (api.post as jest.Mock).mockResolvedValue({});
      await tweetService.repostTweet('1');
      expect(api.post).toHaveBeenCalledWith('/tweets/1/repost');
    });
  });

  describe('undoRepostTweet', () => {
    it('should undo repost of a tweet', async () => {
      (api.delete as jest.Mock).mockResolvedValue({});
      await tweetService.undoRepostTweet('1');
      expect(api.delete).toHaveBeenCalledWith('/tweets/1/repost');
    });
  });

  describe('createTweet', () => {
    it('should create a tweet without media', async () => {
      const mockResponse = { data: { data: { id: '1', content: 'hello' } } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.createTweet('hello');

      expect(api.post).toHaveBeenCalledWith('/tweets', { content: 'hello' });
      expect(result).toEqual(mockResponse.data.data);
    });

    it('should create a tweet with media', async () => {
      const mockImageResponse = { data: { data: { url: 'http://example.com/img.jpg' } } };
      const mockTweetResponse = {
        data: { data: { id: '1', content: 'hello', images: ['http://example.com/img.jpg'] } },
      };

      (api.post as jest.Mock).mockImplementation((url) => {
        if (url === '/tweets/upload/image') return Promise.resolve(mockImageResponse);
        if (url === '/tweets') return Promise.resolve(mockTweetResponse);
        return Promise.reject(new Error('Unknown URL'));
      });

      const result = await tweetService.createTweet('hello', ['file:///img.jpg']);

      expect(api.post).toHaveBeenCalledWith('/tweets', {
        content: 'hello',
        images: ['http://example.com/img.jpg'],
      });
      expect(result).toEqual(mockTweetResponse.data.data);
    });
  });

  describe('deleteTweet', () => {
    it('should delete a tweet', async () => {
      (api.delete as jest.Mock).mockResolvedValue({});
      await tweetService.deleteTweet('1');
      expect(api.delete).toHaveBeenCalledWith('/tweets/1');
    });
  });

  describe('replyToTweet', () => {
    it('should reply to a tweet', async () => {
      const mockResponse = { data: { data: { id: '2', content: 'reply' } } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.replyToTweet('1', 'reply');

      expect(api.post).toHaveBeenCalledWith('/tweets/1/reply', { content: 'reply' });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('quoteTweet', () => {
    it('should quote a tweet', async () => {
      const mockResponse = { data: { data: { id: '2', content: 'quote' } } };
      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.quoteTweet('1', 'quote');

      expect(api.post).toHaveBeenCalledWith('/tweets/1/quote', { content: 'quote' });
      expect(result).toEqual(mockResponse.data.data);
    });
  });

  describe('getTweetQuotes', () => {
    it('should get tweet quotes', async () => {
      const mockResponse = { data: { data: { quotes: [], nextCursor: null } } };
      (api.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await tweetService.getTweetQuotes('1');

      expect(api.get).toHaveBeenCalledWith('/tweets/1/quotes', { params: {} });
      expect(result).toEqual(mockResponse.data.data);
    });
  });
});
