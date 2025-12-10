import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { followingKeys, useFollowingList } from '../../hooks/useFollowingList';
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

describe('useFollowingList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followingKeys', () => {
    it('should generate correct query keys', () => {
      expect(followingKeys.all).toEqual(['following']);
      expect(followingKeys.lists()).toEqual(['following', 'list']);

      const params = { userId: 'user-123', cursor: 'abc', limit: 20 };
      expect(followingKeys.list(params)).toEqual(['following', 'list', params]);
    });
  });

  describe('useFollowingList hook', () => {
    it('should fetch following list successfully', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              userId: 'user-1',
              name: 'User One',
              username: 'userone',
              bio: 'Bio 1',
              avatarUrl: 'avatar1.jpg',
              isFollowing: true,
              isFollower: false,
              isMuted: false,
              isBlocked: false,
            },
          ],
          pagination: {
            nextCursor: 'next-cursor',
            hasMore: true,
          },
        },
        count: 1,
        message: 'Success',
      };

      (profileService.getFollowingList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFollowingList({ userId: 'user-123' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(profileService.getFollowingList).toHaveBeenCalledWith({
        userId: 'user-123',
        cursor: '',
        limit: 20,
      });
    });

    it('should use default parameters', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { nextCursor: null, hasMore: false },
        },
        count: 0,
        message: 'Success',
      };

      (profileService.getFollowingList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFollowingList({ userId: 'user-123' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(profileService.getFollowingList).toHaveBeenCalledWith({
        userId: 'user-123',
        cursor: '',
        limit: 20,
      });
    });

    it('should use custom cursor and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { nextCursor: null, hasMore: false },
        },
        count: 0,
        message: 'Success',
      };

      (profileService.getFollowingList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useFollowingList({
            userId: 'user-123',
            cursor: 'custom-cursor',
            limit: 10,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(profileService.getFollowingList).toHaveBeenCalledWith({
        userId: 'user-123',
        cursor: 'custom-cursor',
        limit: 10,
      });
    });

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(
        () =>
          useFollowingList({
            userId: 'user-123',
            enabled: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(profileService.getFollowingList).not.toHaveBeenCalled();
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = renderHook(() => useFollowingList({ userId: '' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(profileService.getFollowingList).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Network error');
      (profileService.getFollowingList as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useFollowingList({ userId: 'user-123' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('should pass through custom query options', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { nextCursor: null, hasMore: false },
        },
        count: 0,
        message: 'Success',
      };

      (profileService.getFollowingList as jest.Mock).mockResolvedValue(mockResponse);

      const customOptions = {
        staleTime: 10000,
        gcTime: 20000,
      };

      const { result } = renderHook(
        () =>
          useFollowingList({
            userId: 'user-123',
            ...customOptions,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
    });
  });
});
