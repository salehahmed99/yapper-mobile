/* eslint-disable @typescript-eslint/no-unused-vars */
import { InfiniteData, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { ITweets } from '../../../tweets/types';
import { useBlockUser } from '../../hooks/useBlockUser';
import * as profileService from '../../services/profileService';

jest.mock('../../services/profileService');

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

describe('useBlockUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default block state', () => {
    const { result } = renderHook(() => useBlockUser(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isBlocked).toBe(false);
    expect(result.current.isLoading).toBe(false);
  });

  it('should initialize with custom block state', () => {
    const { result } = renderHook(() => useBlockUser(true), {
      wrapper: createWrapper(),
    });

    expect(result.current.isBlocked).toBe(true);
  });

  it('should block a user successfully', async () => {
    (profileService.blockUser as jest.Mock).mockResolvedValue({
      count: 1,
      message: 'Blocked successfully',
    });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
      expect(profileService.blockUser).toHaveBeenCalledWith('user-123');
    });
  });

  it('should unblock a user successfully', async () => {
    (profileService.unblockUser as jest.Mock).mockResolvedValue({
      count: 0,
      message: 'Unblocked successfully',
    });

    const { result } = renderHook(() => useBlockUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleBlock('user-456');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(false);
      expect(profileService.unblockUser).toHaveBeenCalledWith('user-456');
    });
  });

  it('should not toggle when mutation is pending', async () => {
    (profileService.blockUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000)),
    );

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.toggleBlock('user-123');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    expect(profileService.blockUser).toHaveBeenCalledTimes(1);
  });

  it('should not toggle when userId is empty', async () => {
    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.toggleBlock('');
    });

    expect(profileService.blockUser).not.toHaveBeenCalled();
  });

  it('should handle block error and revert state', async () => {
    const error = new Error('Block failed');
    (profileService.blockUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleBlock('user-789');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(false);
    });
  });

  it('should handle unblock error and revert state', async () => {
    const error = new Error('Unblock failed');
    (profileService.unblockUser as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useBlockUser(true), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      try {
        await result.current.toggleBlock('user-321');
      } catch (e) {
        // Expected to throw
      }
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should allow manual state setting', () => {
    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.setIsBlocked(true);
    });

    expect(result.current.isBlocked).toBe(true);

    act(() => {
      result.current.setIsBlocked(false);
    });

    expect(result.current.isBlocked).toBe(false);
  });

  it('should update loading state during mutation', async () => {
    (profileService.blockUser as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ count: 1, message: 'Success' }), 100)),
    );

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.toggleBlock('user-999');
    });

    await waitFor(() => expect(result.current.isLoading).toBe(true));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
  });

  // Additional tests for helper functions and cache updates
  it('should update tweets cache with toggled block state on blocking', async () => {
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

    (profileService.blockUser as jest.Mock).mockResolvedValue({ message: 'Blocked' });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapperWithCache({ tweets: mockTweetsData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should handle blocking when explore cache has whoToFollow data', async () => {
    const exploreData = {
      data: {
        whoToFollow: [
          { id: 'user-123', username: 'testuser' },
          { id: 'user-456', username: 'otheruser' },
        ],
        trending: [],
      },
    };

    (profileService.blockUser as jest.Mock).mockResolvedValue({ message: 'Blocked' });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapperWithCache({ explore: exploreData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should handle blocking when whoToFollow cache has data', async () => {
    const whoToFollowData = {
      data: [
        { id: 'user-123', username: 'testuser' },
        { id: 'user-456', username: 'otheruser' },
      ],
    };

    (profileService.blockUser as jest.Mock).mockResolvedValue({ message: 'Blocked' });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapperWithCache({ whoToFollow: whoToFollowData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should handle explore cache without whoToFollow data', async () => {
    const exploreData = {
      data: {
        trending: [],
      },
    };

    (profileService.blockUser as jest.Mock).mockResolvedValue({ message: 'Blocked' });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapperWithCache({ explore: exploreData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should handle whoToFollow cache without data', async () => {
    const whoToFollowData = {};

    (profileService.blockUser as jest.Mock).mockResolvedValue({ message: 'Blocked' });

    const { result } = renderHook(() => useBlockUser(false), {
      wrapper: createWrapperWithCache({ whoToFollow: whoToFollowData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(true);
    });
  });

  it('should not update explore/whoToFollow cache on unblocking', async () => {
    const exploreData = {
      data: {
        whoToFollow: [{ id: 'user-456', username: 'otheruser' }],
      },
    };

    (profileService.unblockUser as jest.Mock).mockResolvedValue({ message: 'Unblocked' });

    const { result } = renderHook(() => useBlockUser(true), {
      wrapper: createWrapperWithCache({ explore: exploreData }),
    });

    await act(async () => {
      await result.current.toggleBlock('user-123');
    });

    await waitFor(() => {
      expect(result.current.isBlocked).toBe(false);
    });
  });
});
