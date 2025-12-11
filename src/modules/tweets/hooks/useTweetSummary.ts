import { useQuery } from '@tanstack/react-query';
import { getTweetSummary } from '../services/tweetService';

export const useTweetSummary = (tweetId?: string) => {
  return useQuery({
    queryKey: ['tweetSummary', { tweetId }],
    queryFn: () => getTweetSummary(tweetId!),
    enabled: !!tweetId,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};
