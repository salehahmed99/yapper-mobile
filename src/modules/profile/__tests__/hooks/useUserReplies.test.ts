import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useUserReplies, useUserRepliesData } from '../../hooks/useUserReplies';
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

describe('useUserReplies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockRepliesResponse = {
    data: [
      { id: '1', content: 'Reply 1', user: { id: 'user-1', name: 'User 1' } },
      { id: '2', content: 'Reply 2', user: { id: 'user-1', name: 'User 1' } },
    ],
    pagination: {
      nextCursor: 'cursor-2',
      hasMore: true,
    },
  };

  it('should fetch user replies successfully', async () => {
    (profileService.getUserReplies as jest.Mock).mockResolvedValue(mockRepliesResponse);

    const { result } = renderHook(() => useUserReplies('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockRepliesResponse);
    expect(profileService.getUserReplies).toHaveBeenCalledWith({
      userId: 'user-123',
      cursor: '',
      limit: 20,
    });
  });

  it('should not fetch when userId is empty', async () => {
    const { result } = renderHook(() => useUserReplies(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserReplies).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserReplies('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserReplies).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch replies');
    (profileService.getUserReplies as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUserReplies('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should fetch next page when hasMore is true', async () => {
    (profileService.getUserReplies as jest.Mock).mockResolvedValue(mockRepliesResponse);

    const { result } = renderHook(() => useUserReplies('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);
  });

  it('should not have next page when hasMore is false', async () => {
    const noMoreResponse = {
      ...mockRepliesResponse,
      pagination: {
        nextCursor: null,
        hasMore: false,
      },
    };

    (profileService.getUserReplies as jest.Mock).mockResolvedValue(noMoreResponse);

    const { result } = renderHook(() => useUserReplies('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('useUserRepliesData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockReply1 = { id: '1', content: 'Reply 1', user: { id: 'user-1', name: 'User 1' } };
  const mockReply2 = { id: '2', content: 'Reply 2', user: { id: 'user-1', name: 'User 1' } };

  it('should return flattened replies array', async () => {
    (profileService.getUserReplies as jest.Mock).mockResolvedValue({
      data: [mockReply1, mockReply2],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserRepliesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.replies).toEqual([mockReply1, mockReply2]);
  });

  it('should return empty array when no data', async () => {
    (profileService.getUserReplies as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserRepliesData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.replies).toEqual([]);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserRepliesData('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserReplies).not.toHaveBeenCalled();
    expect(result.current.replies).toEqual([]);
  });
});
