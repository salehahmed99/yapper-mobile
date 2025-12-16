import api from '@/src/services/apiClient';
import * as ProfileService from '../../../profile/services/profileService';
import { getUserList } from '../userListService';

// Mock dependencies
jest.mock('../../../profile/services/profileService');
jest.mock('@/src/services/apiClient');
jest.mock('i18next', () => ({
  t: (key: string) => key,
}));

describe('userListService', () => {
  const mockFollowerUser = {
    userId: '1',
    name: 'User 1',
    username: 'user1',
    bio: 'Bio 1',
    avatarUrl: 'http://avatar1',
    isFollowing: true,
    isFollower: true,
    isMuted: false,
    isBlocked: false,
  };

  const mockUser = {
    id: '1',
    name: 'User 1',
    username: 'user1',
    bio: 'Bio 1',
    avatarUrl: 'http://avatar1',
    email: '',
    isFollowing: true,
    isFollower: true,
    isMuted: false,
    isBlocked: false,
  };

  const mockPaginationResponse = {
    data: {
      data: [mockFollowerUser],
      pagination: {
        nextCursor: 'next',
        hasMore: true,
      },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followers', () => {
    it('should fetch followers list correctly', async () => {
      (ProfileService.getFollowersList as jest.Mock).mockResolvedValue(mockPaginationResponse);

      const result = await getUserList({ type: 'followers', userId: '123', cursor: 'init' });

      expect(ProfileService.getFollowersList).toHaveBeenCalledWith({
        userId: '123',
        cursor: 'init',
        limit: 20,
        following: false,
      });
      expect(result.users).toEqual([mockUser]);
      expect(result.nextCursor).toBe('next');
      expect(result.hasMore).toBe(true);
    });
  });

  describe('following', () => {
    it('should fetch following list correctly', async () => {
      (ProfileService.getFollowingList as jest.Mock).mockResolvedValue(mockPaginationResponse);

      const result = await getUserList({ type: 'following', userId: '123' });

      expect(ProfileService.getFollowingList).toHaveBeenCalledWith({
        userId: '123',
        cursor: '',
        limit: 20,
      });
      expect(result.users).toEqual([mockUser]);
    });
  });

  describe('mutualFollowers', () => {
    it('should fetch mutual followers list correctly', async () => {
      (ProfileService.getMutualFollowers as jest.Mock).mockResolvedValue(mockPaginationResponse);

      const result = await getUserList({ type: 'mutualFollowers', userId: '123' });

      expect(ProfileService.getMutualFollowers).toHaveBeenCalledWith({
        userId: '123',
        cursor: '',
        limit: 20,
        following: true,
      });
      expect(result.users).toEqual([mockUser]);
    });
  });

  describe('muted', () => {
    it('should fetch muted list correctly', async () => {
      (ProfileService.getMutedList as jest.Mock).mockResolvedValue(mockPaginationResponse);

      const result = await getUserList({ type: 'muted' });

      expect(ProfileService.getMutedList).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: '',
          limit: 20,
        }),
      );
      expect(result.users).toEqual([mockUser]);
    });
  });

  describe('blocked', () => {
    it('should fetch blocked list correctly', async () => {
      (ProfileService.getBlockedList as jest.Mock).mockResolvedValue(mockPaginationResponse);

      const result = await getUserList({ type: 'blocked' });

      expect(ProfileService.getBlockedList).toHaveBeenCalledWith(
        expect.objectContaining({
          cursor: '',
          limit: 20,
        }),
      );
      expect(result.users).toEqual([mockUser]);
    });
  });

  describe('generic lists (tweets/reposts/likes)', () => {
    const mockBackendResponse = {
      data: {
        data: {
          data: [mockUser],
          hasMore: true,
          nextCursor: 'next-backend',
        },
      },
    };

    it('should fetch likes for a tweet', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBackendResponse);

      const result = await getUserList({ type: 'likes', tweetId: 'tweet1' });

      expect(api.get).toHaveBeenCalledWith('/tweets/tweet1/likes', {
        params: { limit: undefined },
      });
      expect(result.users).toEqual([mockUser]);
      expect(result.nextCursor).toBe('next-backend');
    });

    it('should fetch reposts for a tweet', async () => {
      (api.get as jest.Mock).mockResolvedValue(mockBackendResponse);

      await getUserList({ type: 'reposts', tweetId: 'tweet1', cursor: 'curs' });

      expect(api.get).toHaveBeenCalledWith('/tweets/tweet1/reposts', {
        params: { limit: undefined, cursor: 'curs' },
      });
    });

    it('should throw error if tweetId or userId is missing for generic types', async () => {
      // Need to cast to any to test invalid runtime params that TS would block
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await expect(getUserList({ type: 'likes' } as any)).rejects.toThrow(
        'Invalid parameters: missing tweetId or userId',
      );
    });

    it('should handle API errors', async () => {
      const error = new Error('API Error');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (error as any).response = { data: { message: 'API Error' } };
      (api.get as jest.Mock).mockRejectedValue(error);

      await expect(getUserList({ type: 'likes', tweetId: '1' })).rejects.toThrow('API Error');
    });

    it('should handle API errors with default message', async () => {
      (api.get as jest.Mock).mockRejectedValue(new Error('Network Error'));

      await expect(getUserList({ type: 'likes', tweetId: '1' })).rejects.toThrow('userList.errors.fetchFailed');
    });
  });
});
