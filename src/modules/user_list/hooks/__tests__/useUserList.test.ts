import { useInfiniteQuery } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { getUserList } from '../../services/userListService';
import { useUserList } from '../useUserList';

// Mock dependencies
jest.mock('@tanstack/react-query', () => ({
  useInfiniteQuery: jest.fn(),
}));

jest.mock('../../services/userListService', () => ({
  getUserList: jest.fn(),
}));

describe('useUserList', () => {
  const mockUsers = [{ id: '1', name: 'Test User' }];
  const mockData = {
    pages: [{ users: mockUsers, nextCursor: 'next', hasMore: true }],
    pageParams: [''],
  };

  const mockQueryReturn = {
    data: mockData,
    fetchNextPage: jest.fn(),
    hasNextPage: true,
    isFetchingNextPage: false,
    isLoading: false,
    isRefetching: false,
    error: null,
    refetch: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useInfiniteQuery as jest.Mock).mockReturnValue(mockQueryReturn);
  });

  it('should return users and status', () => {
    const { result } = renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    expect(result.current.users).toEqual(mockUsers);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.hasNextPage).toBe(true);
  });

  it('should call fetchNextPage on loadMore', () => {
    const { result } = renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    act(() => {
      result.current.loadMore();
    });

    expect(mockQueryReturn.fetchNextPage).toHaveBeenCalled();
  });

  it('should not call fetchNextPage if loading next page', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      ...mockQueryReturn,
      isFetchingNextPage: true,
    });

    const { result } = renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    act(() => {
      result.current.loadMore();
    });

    expect(mockQueryReturn.fetchNextPage).not.toHaveBeenCalled();
  });

  it('should call refetch on refresh', () => {
    const { result } = renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    act(() => {
      result.current.refresh();
    });

    expect(mockQueryReturn.refetch).toHaveBeenCalled();
  });

  it('should handle errors', () => {
    (useInfiniteQuery as jest.Mock).mockReturnValue({
      ...mockQueryReturn,
      error: { message: 'Network Error' },
    });

    const { result } = renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    expect(result.current.error).toBe('Network Error');
  });

  it('should generate correct query keys', () => {
    renderHook(() => useUserList({ type: 'followers', userId: '123' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['followers', 'list', { userId: '123', following: false }],
      }),
    );

    renderHook(() => useUserList({ type: 'following', userId: '123' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['following', 'list', { userId: '123' }],
      }),
    );

    renderHook(() => useUserList({ type: 'mutualFollowers', userId: '123' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['followers', 'list', { userId: '123', following: true }],
      }),
    );

    renderHook(() => useUserList({ type: 'likes', tweetId: 'tweet1' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['userList', 'tweet', 'tweet1', 'likes'],
      }),
    );

    // Muted/Blocked
    renderHook(() => useUserList({ type: 'muted' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['userList', 'muted'],
      }),
    );

    renderHook(() => useUserList({ type: 'blocked' }));
    expect(useInfiniteQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['userList', 'blocked'],
      }),
    );
  });

  it('queryFn should call getUserList', async () => {
    renderHook(() => useUserList({ type: 'followers', userId: '123' }));

    const calls = (useInfiniteQuery as jest.Mock).mock.calls[0];
    const options = calls[0];
    const queryFn = options.queryFn;

    await queryFn({ pageParam: 'cursor1' });

    expect(getUserList).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'followers',
        userId: '123',
        cursor: 'cursor1',
      }),
    );
  });

  it('getNextPageParam should work', () => {
    renderHook(() => useUserList({ type: 'followers', userId: '123' }));
    const options = (useInfiniteQuery as jest.Mock).mock.calls[0][0];
    const getNextPageParam = options.getNextPageParam;

    expect(getNextPageParam({ hasMore: true, nextCursor: 'abc' })).toBe('abc');
    expect(getNextPageParam({ hasMore: false, nextCursor: 'abc' })).toBeUndefined();
  });
});
