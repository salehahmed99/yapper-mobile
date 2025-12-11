import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import React from 'react';
import { useUserMedia, useUserMediaData } from '../../hooks/useUserMedia';
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

describe('useUserMedia', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMediaResponse = {
    data: [
      { id: '1', content: 'Media post 1', media: [{ url: 'image1.jpg' }], user: { id: 'user-1', name: 'User 1' } },
      { id: '2', content: 'Media post 2', media: [{ url: 'image2.jpg' }], user: { id: 'user-1', name: 'User 1' } },
    ],
    pagination: {
      nextCursor: 'cursor-2',
      hasMore: true,
    },
  };

  it('should fetch user media successfully', async () => {
    (profileService.getUserMedia as jest.Mock).mockResolvedValue(mockMediaResponse);

    const { result } = renderHook(() => useUserMedia('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.pages[0]).toEqual(mockMediaResponse);
    expect(profileService.getUserMedia).toHaveBeenCalledWith({
      userId: 'user-123',
      cursor: '',
      limit: 20,
    });
  });

  it('should not fetch when userId is empty', async () => {
    const { result } = renderHook(() => useUserMedia(''), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserMedia).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserMedia('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserMedia).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Failed to fetch media');
    (profileService.getUserMedia as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useUserMedia('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should fetch next page when hasMore is true', async () => {
    (profileService.getUserMedia as jest.Mock).mockResolvedValue(mockMediaResponse);

    const { result } = renderHook(() => useUserMedia('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(true);
  });

  it('should not have next page when hasMore is false', async () => {
    const noMoreResponse = {
      ...mockMediaResponse,
      pagination: {
        nextCursor: null,
        hasMore: false,
      },
    };

    (profileService.getUserMedia as jest.Mock).mockResolvedValue(noMoreResponse);

    const { result } = renderHook(() => useUserMedia('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.hasNextPage).toBe(false);
  });
});

describe('useUserMediaData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockMedia1 = { id: '1', content: 'Media 1', media: [{ url: 'image1.jpg' }], user: { id: 'user-1' } };
  const mockMedia2 = { id: '2', content: 'Media 2', media: [{ url: 'image2.jpg' }], user: { id: 'user-1' } };

  it('should return flattened media array', async () => {
    (profileService.getUserMedia as jest.Mock).mockResolvedValue({
      data: [mockMedia1, mockMedia2],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserMediaData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.media).toEqual([mockMedia1, mockMedia2]);
  });

  it('should return empty array when no data', async () => {
    (profileService.getUserMedia as jest.Mock).mockResolvedValue({
      data: [],
      pagination: { nextCursor: null, hasMore: false },
    });

    const { result } = renderHook(() => useUserMediaData('user-123'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.media).toEqual([]);
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() => useUserMediaData('user-123', false), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    expect(profileService.getUserMedia).not.toHaveBeenCalled();
    expect(result.current.media).toEqual([]);
  });
});
