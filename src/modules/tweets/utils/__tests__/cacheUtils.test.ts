import { ITweet } from '../../types';
import {
  removeTweetFromInfiniteCache,
  updateCategoryPostsCache,
  updateExploreCache,
  updateSearchPostsCache,
  updateTweetQuotesCache,
  updateTweetsInInfiniteCache,
} from '../cacheUtils';

// Mock data helpers
const createMockTweet = (id: string, content: string = 'test'): ITweet =>
  ({
    tweetId: id,
    content: content,
    // Add other necessary fields if required by types, casting as any for simplicity if types are extensive
    likes: 0,
    reposts: 0,
    quotes: 0,
    views: 0,
    bookmarks: 0,
    user: {
      userId: 'u1',
      username: 'user1',
      displayName: 'User 1',
      avatarUrl: null,
      bio: null,
      followersCount: 0,
      followingCount: 0,
      isFollowing: false,
      isFollowedBy: false,
    },
    createdAt: new Date().toISOString(),
    media: [],
    hasLiked: false,
    hasReposted: false,
    hasBookmarked: false,
  }) as any;

describe('cacheUtils', () => {
  const mockUpdater = (tweet: ITweet) => ({
    ...tweet,
    content: 'updated',
  });

  describe('updateTweetsInInfiniteCache', () => {
    it('should update a tweet in the list', () => {
      const oldData: any = {
        pages: [{ data: [createMockTweet('1')] }, { data: [createMockTweet('2')] }],
      };

      const result = updateTweetsInInfiniteCache(oldData, '1', mockUpdater);
      expect(result?.pages[0].data[0].content).toBe('updated');
      expect(result?.pages[1].data[0].content).toBe('test');
    });

    it('should handle nested replies', () => {
      const parent = createMockTweet('1');
      parent.replies = [createMockTweet('2')];
      const oldData: any = {
        pages: [{ data: [parent] }],
      };

      const result = updateTweetsInInfiniteCache(oldData, '2', mockUpdater);
      expect(result?.pages[0].data[0].replies![0].content).toBe('updated');
      // Parent should remain strictly equal if nested update logic creates new ref but content same?
      // Actually, updateTweetDeep returns new object if nested changed.
      expect(result?.pages[0].data[0]).not.toBe(parent);
    });

    it('should return oldData if no pages', () => {
      const result = updateTweetsInInfiniteCache(undefined, '1', mockUpdater);
      expect(result).toBeUndefined();
    });
  });

  describe('removeTweetFromInfiniteCache', () => {
    it('should remove a tweet from the list', () => {
      const oldData: any = {
        pages: [{ data: [createMockTweet('1'), createMockTweet('2')] }],
      };
      const result = removeTweetFromInfiniteCache(oldData, '1');
      expect(result?.pages[0].data).toHaveLength(1);
      expect(result?.pages[0].data[0].tweetId).toBe('2');
    });

    it('should remove a matching reply', () => {
      const parent = createMockTweet('1');
      parent.replies = [createMockTweet('2'), createMockTweet('3')];
      const oldData: any = {
        pages: [{ data: [parent] }],
      };

      const result = removeTweetFromInfiniteCache(oldData, '2');
      const updatedParent = result?.pages[0].data[0];
      expect(updatedParent!.replies).toHaveLength(1);
      expect(updatedParent!.replies![0].tweetId).toBe('3');
    });

    it('should unset conversationTweet if matches', () => {
      const parent = createMockTweet('1');
      parent.conversationTweet = createMockTweet('2');
      const oldData: any = { pages: [{ data: [parent] }] };

      const result = removeTweetFromInfiniteCache(oldData, '2');
      expect(result?.pages[0].data[0].conversationTweet).toBeUndefined();
    });
  });

  describe('updateExploreCache', () => {
    it('should update tweets in "tweets" category', () => {
      const oldData: any = {
        data: {
          forYou: [{ tweets: [createMockTweet('1')] }],
        },
      };
      const result = updateExploreCache(oldData, '1', mockUpdater);
      expect(result?.data?.forYou![0].tweets![0].content).toBe('updated');
    });

    it('should update tweets in "posts" category', () => {
      const oldData: any = {
        data: {
          forYou: [{ posts: [createMockTweet('1')] }],
        },
      };
      const result = updateExploreCache(oldData, '1', mockUpdater);
      expect(result?.data?.forYou![0].posts![0].content).toBe('updated');
    });
  });

  describe('updateCategoryPostsCache', () => {
    it('should update tweets in category cache', () => {
      const oldData: any = {
        pages: [{ data: { tweets: [createMockTweet('1')] } }],
      };
      const result = updateCategoryPostsCache(oldData, '1', mockUpdater);
      expect(result?.pages[0].data.tweets[0].content).toBe('updated');
    });
  });

  describe('updateSearchPostsCache', () => {
    it('should update tweets in search cache', () => {
      const oldData: any = {
        pages: [
          { data: { data: [createMockTweet('1')] } }, // nested data.data structure
        ],
      };
      const result = updateSearchPostsCache(oldData, '1', mockUpdater);
      expect(result?.pages[0].data.data[0].content).toBe('updated');
    });
  });

  describe('updateTweetQuotesCache', () => {
    it('should update tweets in quotes cache', () => {
      const oldData: any = {
        pages: [{ data: [createMockTweet('1')] }],
      };
      const result = updateTweetQuotesCache(oldData, '1', mockUpdater);
      expect(result?.pages[0].data[0].content).toBe('updated');
    });
  });
});
