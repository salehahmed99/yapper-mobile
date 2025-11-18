import { useInfiniteQuery } from '@tanstack/react-query';
import { getForYou } from '../services/tweetService';
import { ITweetFilters } from '../types';

export const useTweets = (tweetFilters: ITweetFilters) => {
  return useInfiniteQuery({
    queryKey: ['tweets', tweetFilters],
    queryFn: ({ pageParam }) => getForYou({ ...tweetFilters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined as string | undefined,
  });
};
