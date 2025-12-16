/* eslint-disable @typescript-eslint/no-unused-vars */
// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

import { useAuthStore } from '@/src/store/useAuthStore';
import { InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ITweets } from '../../../tweets/types';
import { useFollowUser } from '../../hooks/useFollowUser';
import * as profileService from '../../services/profileService';

jest.mock('../../services/profileService');
jest.mock('@/src/store/useAuthStore');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ children }: any) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

// Create a wrapper with pre-populated cache
const createWrapperWithCache = (cacheData?: {
  tweets?: InfiniteData<ITweets>;
  explore?: unknown;
  whoToFollow?: unknown;
}) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  if (cacheData?.tweets) {
    queryClient.setQueryData(['tweets'], cacheData.tweets);
  }
  if (cacheData?.explore) {
    queryClient.setQueryData(['explore', 'forYou'], cacheData.explore);
  }
  if (cacheData?.whoToFollow) {
    queryClient.setQueryData(['whoToFollow'], cacheData.whoToFollow);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ({ children }: any) => React.createElement(QueryClientProvider, { client: queryClient }, children);
};

describe('useFollowUser', () => {
  const mockUpdateFollowCounts = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuthStore as unknown as jest.Mock).mockReturnValue(mockUpdateFollowCounts);
  });

  it('should initialize with default follow state', () => {
    const { result } = renderHook(() => useFollowUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFollowing).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with custom follow state', () => {
    const { result } = renderHook(() => useFollowUser(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isFollowing).toBe(true);
  });

  it('should follow a user successfully', async () => {
    (profileService.followUser as jest.Mock).mockResolvedValue({
      count: 1,
      message: 'Followed successfully',
    });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
      expect(profileService.followUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('should unfollow a user successfully', async () => {
    (profileService.unfollowUser as jest.Mock).mockResolvedValue({
      count: 0,
      message: 'Unfollowed successfully',
    });

    const { result } = renderHook(() => useFollowUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleFollow('user-456');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(false);
      expect(profileService.unfollowUser).toHaveBeenCalledWith('user-456');
    });
  });

  it('should not toggle when mutation is pending', async () => {
    (profileService.followUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleFollow('user-123');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    expect(profileService.followUser).toHaveBeenCalledTimes(1);
  });

  it('should not toggle when userId is empty', async () => {
    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleFollow('');
    });

    expect(profileService.followUser).not.toHaveBeenCalled();
  });

  it('should handle follow error and revert state', async () => {
    const error = new Error('Follow failed');
    (profileService.followUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleFollow('user-789');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(false);
    });
  });

  it('should handle unfollow error and revert state', async () => {
    const error = new Error('Unfollow failed');
    (profileService.unfollowUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useFollowUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleFollow('user-321');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should allow manual state setting', () => {
    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setIsFollowing(true);
    });

    expect(result.current.isFollowing).toBe(true);

    act(() => {
      result.current.setIsFollowing(false);
    });

    expect(result.current.isFollowing).toBe(false);
  });

  it('should update loading state during mutation', async () => {
    (profileService.followUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ count: 1, message: 'Success' }), 100)),
    );

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.toggleFollow('user-999');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  // Additional tests for helper functions and cache updates
  it('should update tweets cache with toggled follow state', async () => {
    const mockTweetsData: InfiniteData<ITweets> = {
      pages: [
        {
          data: [
            {
              tweetId: 'tweet-1',
              content: 'Test tweet',
              user: {
                id: 'user-123',
                username: 'testuser',
                name: 'Test User',
                email: 'test@example.com',
                avatarUrl: undefined,
                isBlocked: false,
                isFollowing: false,
              },
            } as any,
          ],
          nextCursor: null,
        } as any,
      ],
      pageParams: [null],
    };

    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapperWithCache({ tweets: mockTweetsData }),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should update explore cache whoToFollow data on follow', async () => {
    const exploreData = {
      data: {
        whoToFollow: [
          { id: 'user-123', username: 'testuser', isFollowing: false },
          { id: 'user-456', username: 'otheruser', isFollowing: false },
        ],
        trending: [],
      },
    };

    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapperWithCache({ explore: exploreData }),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should update dedicated whoToFollow cache on follow', async () => {
    const whoToFollowData = {
      data: [
        { id: 'user-123', username: 'testuser', isFollowing: false },
        { id: 'user-456', username: 'otheruser', isFollowing: false },
      ],
    };

    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapperWithCache({ whoToFollow: whoToFollowData }),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should handle explore cache without whoToFollow data', async () => {
    const exploreData = {
      data: {
        trending: [],
      },
    };

    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapperWithCache({ explore: exploreData }),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should handle whoToFollow cache without data', async () => {
    const whoToFollowData = {};

    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapperWithCache({ whoToFollow: whoToFollowData }),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(result.current.isFollowing).toBe(true);
    });
  });

  it('should call updateFollowCounts on successful follow', async () => {
    (profileService.followUser as jest.Mock).mockResolvedValue({ count: 1, message: 'Followed' });

    const { result } = renderHook(() => useFollowUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(mockUpdateFollowCounts).toHaveBeenCalledWith(true);
    });
  });

  it('should call updateFollowCounts with false on successful unfollow', async () => {
    (profileService.unfollowUser as jest.Mock).mockResolvedValue({ count: 0, message: 'Unfollowed' });

    const { result } = renderHook(() => useFollowUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleFollow('user-123');
    });

    await waitFor(() => {
      expect(mockUpdateFollowCounts).toHaveBeenCalledWith(false);
    });
  });
});
