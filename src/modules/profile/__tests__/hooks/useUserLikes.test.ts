import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useUserLikesData } from '../../hooks/useUserLikes';
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

describe('useUserLikesData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLikesResponse = {
    data: [
      { id: '1', content: 'Liked post 1', user: { id: 'user-1', name: 'User 1' } },
      { id: '2', content: 'Liked post 2', user: { id: 'user-1', name: 'User 1' } },
    ],
    pagination: {
      nextCursor: 'cursor-2',
      hasMore: true,
    },
  };

  it('should fetch user likes successfully', async () => {
    (profileService.getUserLikes as jest.Mock).mockResolvedValue(mockLikesResponse);

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.likes).toEqual(mockLikesResponse.data);
    expect(profileService.getUserLikes).toHaveBeenCalledWith({
      userId: 'user-123',
      cursor: '',
      limit: 20,
    });
  });

  it('should not fetch when userId is empty', async () => {
    const { result } = renderHook(() => useUserLikesData(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(profileService.getUserLikes).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserLikesData('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(profileService.getUserLikes).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch likes');
    (profileService.getUserLikes as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.error).toBeTruthy());

    expect(result.current.error).toEqual(error);
  });

  it('should return flattened likes array', async () => {
    const mockLike1 = { id: '1', content: 'Like 1', user: { id: 'user-1', name: 'User 1' } };
    const mockLike2 = { id: '2', content: 'Like 2', user: { id: 'user-1', name: 'User 1' } };

    (profileService.getUserLikes as jest.Mock).mockResolvedValue({
      data: [mockLike1, mockLike2],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.likes).toEqual([mockLike1, mockLike2]);
  });

  it('should return empty array when no data', async () => {
    (profileService.getUserLikes as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.likes).toEqual([]);
  });

  it('should have hasNextPage when more data available', async () => {
    (profileService.getUserLikes as jest.Mock).mockResolvedValue(mockLikesResponse);

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(true);
  });

  it('should not have hasNextPage when no more data', async () => {
    const noMoreResponse = {
      ...mockLikesResponse,
      pagination: {
        nextCursor: null,
        hasMore: false,
      },
    };

    (profileService.getUserLikes as jest.Mock).mockResolvedValue(noMoreResponse);

    const { result } = renderHook(() => useUserLikesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.hasNextPage).toBe(false);
  });
});
