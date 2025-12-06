import { useInfiniteQuery } from '@tanstack/react-query';
import { getTweetReplies } from '../services/tweetService';
import { useTweetsFiltersStore } from '../store/useTweetsFiltersStore';

export const useReplies = (tweetId: string) => {
  const filters = useTweetsFiltersStore((state) => state.filters);
  return useInfiniteQuery({
    queryKey: ['replies', { tweetId }, filters],
    queryFn: ({ pageParam }) => getTweetReplies(tweetId, { ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    maxPages: 10, // Keep only last 10 pages in memory to prevent OOM
  });
};
