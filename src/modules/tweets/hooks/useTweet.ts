import { useQuery } from '@tanstack/react-query';
import { getTweetById } from '../services/tweetService';

export const useTweet = (tweetId?: string) => {
  return useQuery({
    queryKey: ['tweet', { tweetId }],
    queryFn: () => getTweetById(tweetId!),
    enabled: !!tweetId,
  });
};
