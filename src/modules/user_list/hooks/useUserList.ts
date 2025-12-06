import { IUser } from '@/src/types/user';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { getUserList } from '../services/userListService';
import { UserListQuery } from '../types';

type UseUserListOptions = UserListQuery & {
  autoLoad?: boolean;
};

interface IUseUserListResult {
  users: IUser[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  hasNextPage: boolean;
  refresh: () => void;
  loadMore: () => void;
}

// Generate query keys based on the query type
const getUserListQueryKey = (query: UserListQuery) => {
  if ('tweetId' in query) {
    return ['userList', 'tweet', query.tweetId, query.type];
  } else if ('userId' in query && query.type === 'followers') {
    return ['followers', 'list', { userId: query.userId, following: false }];
  } else if ('userId' in query && query.type === 'following') {
    return ['following', 'list', { userId: query.userId }];
  } else if ('userId' in query && query.type === 'mutualFollowers') {
    return ['followers', 'list', { userId: query.userId, following: true }];
  } else if (query.type === 'muted') {
    return ['userList', 'muted'];
  } else if (query.type === 'blocked') {
    return ['userList', 'blocked'];
  }
  return ['userList', query.type];
};

export const useUserList = (options: UseUserListOptions): IUseUserListResult => {
  const { autoLoad = true, ...query } = options;

  const queryKey = getUserListQueryKey(query);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isRefetching, error, refetch } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam }) => getUserList({ ...query, cursor: pageParam || '' }),
      getNextPageParam: (lastPage) => {
        return lastPage.hasMore ? lastPage.nextCursor : undefined;
      },
      initialPageParam: '',
      enabled: autoLoad,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    });

  const users = useMemo(() => {
    return data?.pages.flatMap((page) => page.users) ?? [];
  }, [data]);

  const refresh = () => {
    refetch();
  };

  const loadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  return {
    users,
    loading: isLoading,
    refreshing: isRefetching && !isFetchingNextPage,
    error: error?.message ?? null,
    hasNextPage: hasNextPage ?? false,
    refresh,
    loadMore,
  };
};
