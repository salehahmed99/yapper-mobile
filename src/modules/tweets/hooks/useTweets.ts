import { useQuery } from '@tanstack/react-query';
import { getForYou } from '../services/tweetService';
import { ITweetFilters } from '../types';

export const useTweets = (tweetFilters: ITweetFilters) => {
  return useQuery({
    queryKey: ['tweets', tweetFilters],
    queryFn: () => getForYou(tweetFilters),
  });
};
