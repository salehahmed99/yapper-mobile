import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useUserPosts, useUserPostsData } from '../../hooks/useUserPosts';
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

describe('useUserPosts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPostsResponse = {
    data: [
      { id: '1', content: 'Post 1', user: { id: 'user-1', name: 'User 1' } },
      { id: '2', content: 'Post 2', user: { id: 'user-1', name: 'User 1' } },
    ],
    pagination: {
      nextCursor: 'cursor-2',
      hasMore: true,
    },
  };

  it('should fetch user posts successfully', async () => {
    (profileService.getUserPosts as jest.Mock).mockResolvedValue(mockPostsResponse);

    const { result } = renderHook(() => useUserPosts('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockPostsResponse);
    expect(profileService.getUserPosts).toHaveBeenCalledWith({
      userId: 'user-123',
      cursor: '',
      limit: 20,
    });
  });

  it('should not fetch when userId is empty', async () => {
    const { result } = renderHook(() => useUserPosts(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserPosts).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserPosts('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserPosts).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch posts');
    (profileService.getUserPosts as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUserPosts('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should fetch next page when hasMore is true', async () => {
    (profileService.getUserPosts as jest.Mock).mockResolvedValue(mockPostsResponse);

    const { result } = renderHook(() => useUserPosts('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);
  });

  it('should not have next page when hasMore is false', async () => {
    const noMoreResponse = {
      ...mockPostsResponse,
      pagination: {
        nextCursor: null,
        hasMore: false,
      },
    };

    (profileService.getUserPosts as jest.Mock).mockResolvedValue(noMoreResponse);

    const { result } = renderHook(() => useUserPosts('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('useUserPostsData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockPost1 = { id: '1', content: 'Post 1', user: { id: 'user-1', name: 'User 1' } };
  const mockPost2 = { id: '2', content: 'Post 2', user: { id: 'user-1', name: 'User 1' } };

  it('should return flattened posts array', async () => {
    (profileService.getUserPosts as jest.Mock).mockResolvedValue({
      data: [mockPost1, mockPost2],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserPostsData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.posts).toEqual([mockPost1, mockPost2]);
  });

  it('should return empty array when no data', async () => {
    (profileService.getUserPosts as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserPostsData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.posts).toEqual([]);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserPostsData('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserPosts).not.toHaveBeenCalled();
    expect(result.current.posts).toEqual([]);
  });
});
