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
    getNextPageParam: (lastPage) => lastPage.next_cursor,
    initialPageParam: undefined as string | undefined,
  });
};
