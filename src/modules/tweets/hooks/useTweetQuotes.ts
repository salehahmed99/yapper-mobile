import { useInfiniteQuery } from '@tanstack/react-query';
import { getTweetQuotes } from '../services/tweetService';

export const useTweetQuotes = (tweetId: string) => {
  return useInfiniteQuery({
    queryKey: ['tweet-quotes', tweetId],
    queryFn: ({ pageParam }) => getTweetQuotes(tweetId, { cursor: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.has_more ? lastPage.next_cursor : undefined),
    initialPageParam: undefined as string | undefined,
    enabled: !!tweetId,
  });
};
