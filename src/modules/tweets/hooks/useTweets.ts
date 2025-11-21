import { useInfiniteQuery } from '@tanstack/react-query';
import { getFollowing, getForYou } from '../services/tweetService';
import { ITweetFilters } from '../types';

type TimelineType = 'for-you' | 'following';

export const useTweets = (tweetFilters: ITweetFilters, timelineType: TimelineType = 'for-you') => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cursor, ...filters } = tweetFilters;

  const queryFn = timelineType === 'for-you' ? getForYou : getFollowing;

  return useInfiniteQuery({
    queryKey: ['tweets', timelineType, filters],
    queryFn: ({ pageParam }) => queryFn({ ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor,
    initialPageParam: undefined as string | undefined,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    maxPages: 10, // Keep only last 10 pages in memory to prevent OOM
  });
};
