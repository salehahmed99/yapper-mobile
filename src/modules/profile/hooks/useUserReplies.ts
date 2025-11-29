import { ITweet } from '@/src/modules/tweets/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PROFILE_QUERY_CONFIG, profileQueryKeys } from '../config/queryConfig';
import { getUserReplies } from '../services/profileService';

export const useUserReplies = (userId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: profileQueryKeys.userReplies(userId),
    queryFn: async ({ pageParam }) => {
      const response = await getUserReplies({
        userId,
        cursor: pageParam,
        limit: PROFILE_QUERY_CONFIG.pagination.defaultLimit,
      });
      return response.data;
    },
    initialPageParam: '',
    getNextPageParam: (lastPage) => {
      return lastPage.pagination.hasMore ? lastPage.pagination.nextCursor : undefined;
    },
    enabled: !!userId && enabled,
    staleTime: PROFILE_QUERY_CONFIG.tweets.staleTime,
    gcTime: PROFILE_QUERY_CONFIG.tweets.gcTime,
    refetchOnWindowFocus: PROFILE_QUERY_CONFIG.pagination.refetchOnWindowFocus,
    refetchOnReconnect: PROFILE_QUERY_CONFIG.pagination.refetchOnReconnect,
  });
};

export const useUserRepliesData = (userId: string, enabled: boolean = true) => {
  const query = useUserReplies(userId, enabled);

  const replies: ITweet[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.data as ITweet[]) ?? [],
    [query.data?.pages],
  );

  return {
    ...query,
    replies,
  };
};
