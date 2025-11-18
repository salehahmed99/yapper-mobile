import { useInfiniteQuery } from '@tanstack/react-query';
import { getForYou } from '../services/tweetService';
import { ITweetFilters } from '../types';

export const useTweets = (tweetFilters: ITweetFilters) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { cursor, ...filters } = tweetFilters;
  return useInfiniteQuery({
    queryKey: ['tweets', filters],
    queryFn: ({ pageParam }) => getForYou({ ...filters, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined as string | undefined,
  });
};
