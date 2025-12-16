import { useInfiniteQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useTweetsFiltersStore } from '../../store/useTweetsFiltersStore';
import { useReplies } from '../useReplies';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/tweetService', () => ({
  getTweetReplies: jest.fn(),
}));

jest.mock('../../store/useTweetsFiltersStore', () => ({
  useTweetsFiltersStore: jest.fn(),
}));

describe('useReplies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useTweetsFiltersStore as unknown as jest.Mock).mockImplementation((selector: any) => {
      const state = { filters: { sortBy: 'recent' } };
      return selector(state);
    });
    (useInfiniteQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    }));
  });

  it('should call useInfiniteQuery with correct queryKey', () => {
    renderHook(() => useReplies('tweet123'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['replies', { tweetId: 'tweet123' }, { sortBy: 'recent' }],
      }),
    );
  });

  it('should set undefined as initial page param', () => {
    renderHook(() => useReplies('tweet456'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        initialPageParam: undefined,
      }),
    );
  });

  it('should set cache time to 5 minutes', () => {
    renderHook(() => useReplies('tweet789'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        gcTime: 5 * 60 * 1000,
      }),
    );
  });

  it('should set stale time to 30 seconds', () => {
    renderHook(() => useReplies('tweet000'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        staleTime: 30 * 1000,
      }),
    );
  });

  it('should set maxPages to 10', () => {
    renderHook(() => useReplies('tweet111'));

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPages: 10,
      }),
    );
  });

  it('should use lastPage nextCursor for pagination', () => {
    renderHook(() => useReplies('tweet222'));

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = { nextCursor: 'cursor-abc' };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBe('cursor-abc');
  });

  it('should return undefined nextCursor when not provided', () => {
    renderHook(() => useReplies('tweet333'));

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = { nextCursor: undefined };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBeUndefined();
  });

  it('should include filters in queryFn call', () => {
    const { getTweetReplies } = require('../../services/tweetService');

    renderHook(() => useReplies('tweet444'));

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    config.queryFn({ pageParam: 'cursor-123' });

    expect(getTweetReplies).toHaveBeenCalledWith(
      'tweet444',
      expect.objectContaining({
        sortBy: 'recent',
        cursor: 'cursor-123',
      }),
    );
  });

  it('should return infinite query result', () => {
    const mockResult = {
      data: { pages: [] },
      isLoading: false,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    };

    (useInfiniteQuery as jest.Mock).mockReturnValue(mockResult);

    const { result } = renderHook(() => useReplies('tweet555'));

    expect(result.current).toBe(mockResult);
  });
});
