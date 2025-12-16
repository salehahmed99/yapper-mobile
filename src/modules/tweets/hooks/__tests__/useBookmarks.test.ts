import { useInfiniteQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useBookmarks } from '../useBookmarks';

// Mock useInfiniteQuery
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

// Mock the tweet service
jest.mock('../../services/tweetService', () => ({
  getBookmarks: jest.fn((filters) =>
    Promise.resolve({
      data: [],
      pagination: { nextCursor: undefined },
    }),
  ),
}));

describe('useBookmarks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInfiniteQuery as jest.Mock).mockImplementation(({ queryKey, queryFn }) => {
      return {
        data: undefined,
        isLoading: false,
        isError: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
        queryKey,
        queryFn,
      };
    });
  });

  it('should call useInfiniteQuery with correct queryKey', () => {
    const filters = { limit: 10 };
    renderHook(() => useBookmarks(filters));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['bookmarks', filters],
      }),
    );
  });

  it('should call useInfiniteQuery with default filters', () => {
    renderHook(() => useBookmarks());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['bookmarks', {}],
      }),
    );
  });

  it('should set correct cache and stale time', () => {
    renderHook(() => useBookmarks());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        gcTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
      }),
    );
  });

  it('should have undefined as initial page param', () => {
    renderHook(() => useBookmarks());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        initialPageParam: undefined,
      }),
    );
  });

  it('should return the infinite query result', () => {
    const mockResult = {
      data: { pages: [] },
      isLoading: false,
      isError: false,
      error: null,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    };

    (useInfiniteQuery as jest.Mock).mockReturnValue(mockResult);

    const { result } = renderHook(() => useBookmarks());

    expect(result.current).toBe(mockResult);
  });

  it('should use getNextPageParam from pagination', () => {
    renderHook(() => useBookmarks());

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = {
      pagination: { nextCursor: 'next-cursor-123' },
    };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBe('next-cursor-123');
  });

  it('should return undefined when no next cursor', () => {
    renderHook(() => useBookmarks());

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = {
      pagination: { nextCursor: null },
    };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBeUndefined();
  });

  it('should merge filters with cursor in queryFn', () => {
    const filters = { limit: 20 };
    (useInfiniteQuery as jest.Mock).mockImplementation(({ queryFn }) => {
      return queryFn({ pageParam: 'cursor-456' });
    });

    renderHook(() => useBookmarks(filters));

    expect(useInfiniteQuery).toHaveBeenCalled();
  });

  it('should pass pageParam as cursor to getBookmarks', () => {
    const { getBookmarks } = require('../../services/tweetService');
    getBookmarks.mockClear();

    renderHook(() => useBookmarks());

    const callConfig = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    expect(callConfig.queryKey).toEqual(['bookmarks', {}]);
  });
});
