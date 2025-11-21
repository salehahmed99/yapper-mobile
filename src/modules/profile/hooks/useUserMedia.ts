import { ITweet } from '@/src/modules/tweets/types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { PROFILE_QUERY_CONFIG, profileQueryKeys } from '../config/queryConfig';
import { getUserMedia } from '../services/profileService';

export const useUserMedia = (userId: string) => {
  return useInfiniteQuery({
    queryKey: profileQueryKeys.userMedia(userId),
    queryFn: async ({ pageParam }) => {
      const response = await getUserMedia({
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
    enabled: !!userId,
    staleTime: PROFILE_QUERY_CONFIG.tweets.staleTime,
    gcTime: PROFILE_QUERY_CONFIG.tweets.gcTime,
    refetchOnWindowFocus: PROFILE_QUERY_CONFIG.pagination.refetchOnWindowFocus,
    refetchOnReconnect: PROFILE_QUERY_CONFIG.pagination.refetchOnReconnect,
  });
};

export const useUserMediaData = (userId: string) => {
  const query = useUserMedia(userId);

  const media: ITweet[] = useMemo(
    () => query.data?.pages.flatMap((page) => page.data as ITweet[]) ?? [],
    [query.data?.pages],
  );

  return {
    ...query,
    media,
  };
};
