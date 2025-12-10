import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PROFILE_QUERY_CONFIG, profileQueryKeys } from '../config/queryConfig';
import { getUserLikes } from '../services/profileService';

export const useUserLikesData = (userId: string, enabled: boolean = true) => {
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: profileQueryKeys.userLikes(userId),
    queryFn: async ({ pageParam }) => {
      return await getUserLikes({
        userId,
        cursor: pageParam,
        limit: PROFILE_QUERY_CONFIG.pagination.defaultLimit,
      });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.pagination.hasMore) {
        return lastPage.pagination.nextCursor;
      }
      return undefined;
    },
    initialPageParam: '',
    maxPages: PROFILE_QUERY_CONFIG.pagination.maxPages,
    enabled: !!userId && enabled,
    staleTime: PROFILE_QUERY_CONFIG.tweets.staleTime,
    gcTime: PROFILE_QUERY_CONFIG.tweets.gcTime,
    refetchOnWindowFocus: PROFILE_QUERY_CONFIG.pagination.refetchOnWindowFocus,
    refetchOnReconnect: PROFILE_QUERY_CONFIG.pagination.refetchOnReconnect,
  });

  const likes = useMemo(() => data?.pages.flatMap((page) => page.data) ?? [], [data?.pages]);

  return {
    likes,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
