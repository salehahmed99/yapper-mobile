import { useInfiniteQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';
import { useNotifications } from '../useNotifications';

jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/notificationService', () => ({
  getNotifications: jest.fn(),
}));

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useInfiniteQuery as jest.Mock).mockImplementation(() => ({
      data: undefined,
      isLoading: false,
      isError: false,
      hasNextPage: false,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    }));
  });

  it('should call useInfiniteQuery with notifications query key', () => {
    renderHook(() => useNotifications());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['notifications'],
      }),
    );
  });

  it('should set initial page param to 1', () => {
    renderHook(() => useNotifications());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        initialPageParam: 1,
      }),
    );
  });

  it('should set cache and stale time to 5 minutes', () => {
    renderHook(() => useNotifications());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        gcTime: 5 * 60 * 1000,
        staleTime: 5 * 60 * 1000,
      }),
    );
  });

  it('should set maxPages to 10', () => {
    renderHook(() => useNotifications());

    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        maxPages: 10,
      }),
    );
  });

  it('should return next page when hasNext is true', () => {
    renderHook(() => useNotifications());

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = { hasNext: true, page: 2 };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBe(3);
  });

  it('should return undefined when hasNext is false', () => {
    renderHook(() => useNotifications());

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const lastPage = { hasNext: false, page: 10 };

    const nextParam = config.getNextPageParam(lastPage);
    expect(nextParam).toBeUndefined();
  });

  it('should call getNotifications with page param', () => {
    const { getNotifications } = require('../../services/notificationService');

    renderHook(() => useNotifications());

    const config = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    config.queryFn({ pageParam: 2 });

    expect(getNotifications).toHaveBeenCalledWith({ page: 2 });
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

    const { result } = renderHook(() => useNotifications());

    expect(result.current).toBe(mockResult);
  });
});
