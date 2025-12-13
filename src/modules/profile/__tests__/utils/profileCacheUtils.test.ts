import { InfiniteData } from '@tanstack/react-query';
import { ITweet, ITweets } from '../../../tweets/types';
import { updateUserStateInTweetsCache } from '../../utils/profileCacheUtils';

describe('profileCacheUtils', () => {
  describe('updateUserStateInTweetsCache', () => {
    const mockTweet1: ITweet = {
      tweetId: '1',
      type: 'tweet' as const,
      content: 'Tweet 1',
      user: {
        id: 'user-123',
        name: 'User One',
        username: 'userone',
        email: 'userone@example.com',
        avatarUrl: 'avatar1.jpg',
        isFollowing: false,
        isFollower: false,
        isMuted: false,
        isBlocked: false,
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
      images: [],
      videos: [],
      likesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      repliesCount: 0,
      viewsCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      mentions: [],
    };

    const mockTweet2: ITweet = {
      tweetId: '2',
      type: 'tweet' as const,
      content: 'Tweet 2',
      user: {
        id: 'user-456',
        name: 'User Two',
        username: 'usertwo',
        email: 'usertwo@example.com',
        avatarUrl: 'avatar2.jpg',
        isFollowing: false,
        isFollower: false,
        isMuted: false,
        isBlocked: false,
      },
      createdAt: '2024-01-02',
      updatedAt: '2024-01-02',
      images: [],
      videos: [],
      likesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      repliesCount: 0,
      viewsCount: 0,
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      mentions: [],
    };

    const mockOldData: InfiniteData<ITweets> = {
      pages: [
        {
          data: [mockTweet1, mockTweet2],
          pagination: { nextCursor: 'cursor1', hasMore: true },
        },
      ],
      pageParams: [],
    };

    it('should update user state for matching userId', () => {
      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isFollowing: true },
      });

      const result = updateUserStateInTweetsCache(mockOldData, 'user-123', updater);

      expect(result?.pages[0].data[0].user.isFollowing).toBe(true);
      expect(result?.pages[0].data[1].user.isFollowing).toBe(false);
    });

    it('should not update tweets with non-matching userId', () => {
      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isBlocked: true },
      });

      const result = updateUserStateInTweetsCache(mockOldData, 'user-999', updater);

      expect(result?.pages[0].data[0].user.isBlocked).toBe(false);
      expect(result?.pages[0].data[1].user.isBlocked).toBe(false);
    });

    it('should return undefined when oldData is undefined', () => {
      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isMuted: true },
      });

      const result = updateUserStateInTweetsCache(undefined, 'user-123', updater);

      expect(result).toBeUndefined();
    });

    it('should return oldData when pages is undefined', () => {
      const oldDataWithoutPages = {} as InfiniteData<ITweets>;
      const updater = (tweet: ITweet) => tweet;

      const result = updateUserStateInTweetsCache(oldDataWithoutPages, 'user-123', updater);

      expect(result).toEqual(oldDataWithoutPages);
    });

    it('should handle multiple pages', () => {
      const multiPageData: InfiniteData<ITweets> = {
        pages: [
          {
            data: [mockTweet1],
            pagination: { nextCursor: 'cursor1', hasMore: true },
          },
          {
            data: [mockTweet2],
            pagination: { nextCursor: '', hasMore: false },
          },
        ],
        pageParams: [undefined],
      };

      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isFollowing: true },
      });

      const result = updateUserStateInTweetsCache(multiPageData, 'user-123', updater);

      expect(result?.pages[0].data[0].user.isFollowing).toBe(true);
      expect(result?.pages[1].data[0].user.isFollowing).toBe(false);
    });

    it('should preserve other tweet properties', () => {
      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isFollowing: true },
      });

      const result = updateUserStateInTweetsCache(mockOldData, 'user-123', updater);

      expect(result?.pages[0].data[0].content).toBe('Tweet 1');
      expect(result?.pages[0].data[0].tweetId).toBe('1');
      expect(result?.pages[0].data[0].user.name).toBe('User One');
    });

    it('should handle empty data array', () => {
      const emptyData: InfiniteData<ITweets> = {
        pages: [
          {
            data: [],
            pagination: { nextCursor: '', hasMore: false },
          },
        ],
        pageParams: [undefined],
      };

      const updater = (tweet: ITweet) => ({
        ...tweet,
        user: { ...tweet.user, isFollowing: true },
      });

      const result = updateUserStateInTweetsCache(emptyData, 'user-123', updater);

      expect(result?.pages[0].data).toEqual([]);
    });
  });
});
