import { useQuery } from '@tanstack/react-query';
import { getTrends } from '../services/exploreService';
import { ExploreTab, ITrendListResponse } from '../types';

/**
 * Hook to fetch trends for a specific tab using react-query
 */
export const useTrends = (tab: ExploreTab, enabled: boolean = true) => {
  const categoryMap: Record<string, string | undefined> = {
    trending: undefined,
    news: 'news',
    sports: 'sports',
    entertainment: 'entertainment',
  };

  return useQuery<ITrendListResponse>({
    queryKey: ['trends', tab],
    queryFn: async () => {
      const response = await getTrends(categoryMap[tab]);
      return response;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
