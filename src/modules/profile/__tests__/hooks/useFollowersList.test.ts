import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { followersKeys, useFollowersList } from '../../hooks/useFollowersList';
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

describe('useFollowersList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('followersKeys', () => {
    it('should generate correct query keys', () => {
      expect(followersKeys.all).toEqual(['followers']);
      expect(followersKeys.lists()).toEqual(['followers', 'list']);

      const params = { userId: 'user-123', cursor: 'abc', limit: 20, following: false };
      expect(followersKeys.list(params)).toEqual(['followers', 'list', params]);
    });
  });

  describe('useFollowersList hook', () => {
    it('should fetch followers list successfully', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              userId: 'user-1',
              name: 'User One',
              username: 'userone',
              bio: 'Bio 1',
              avatarUrl: 'avatar1.jpg',
              isFollowing: false,
              isFollower: true,
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

      (profileService.getFollowersList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFollowersList({ userId: 'user-123' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockResponse);
      expect(profileService.getFollowersList).toHaveBeenCalledWith({
        userId: 'user-123',
        cursor: '',
        limit: 20,
        following: false,
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

      (profileService.getFollowersList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useFollowersList({ userId: 'user-456' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(profileService.getFollowersList).toHaveBeenCalledWith({
        userId: 'user-456',
        cursor: '',
        limit: 20,
        following: false,
      });
    });

    it('should use custom cursor, limit, and following flag', async () => {
      const mockResponse = {
        data: {
          data: [],
          pagination: { nextCursor: null, hasMore: false },
        },
        count: 0,
        message: 'Success',
      };

      (profileService.getFollowersList as jest.Mock).mockResolvedValue(mockResponse);

      const { result } = renderHook(
        () =>
          useFollowersList({
            userId: 'user-789',
            cursor: 'custom-cursor',
            limit: 15,
            following: true,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(profileService.getFollowersList).toHaveBeenCalledWith({
        userId: 'user-789',
        cursor: 'custom-cursor',
        limit: 15,
        following: true,
      });
    });

    it('should not fetch when enabled is false', async () => {
      const { result } = renderHook(
        () =>
          useFollowersList({
            userId: 'user-123',
            enabled: false,
          }),
        { wrapper: createWrapper() },
      );

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(profileService.getFollowersList).not.toHaveBeenCalled();
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = renderHook(() => useFollowersList({ userId: '' }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isPending).toBe(true));

      expect(profileService.getFollowersList).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Failed to fetch followers');
      (profileService.getFollowersList as jest.Mock).mockRejectedValue(error);

      const { result } = renderHook(() => useFollowersList({ userId: 'user-123' }), {
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

      (profileService.getFollowersList as jest.Mock).mockResolvedValue(mockResponse);

      const customOptions = {
        staleTime: 15000,
        gcTime: 25000,
      };

      const { result } = renderHook(
        () =>
          useFollowersList({
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
