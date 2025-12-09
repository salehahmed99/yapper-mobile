import { useInfiniteQuery } from '@tanstack/react-query';
import { getCategoryTweets } from '../services/exploreService';

/**
 * Hook to fetch category posts using react-query with pagination
 * Uses 'categoryPosts' query key for cache updates in useTweetActions
 */
export const useCategoryPosts = (categoryId: string, enabled: boolean = true) => {
  return useInfiniteQuery({
    queryKey: ['categoryPosts', categoryId],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await getCategoryTweets(categoryId, pageParam);
      return response;
    },
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.data.pagination.hasMore) {
        return allPages.length + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: enabled && !!categoryId,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};
