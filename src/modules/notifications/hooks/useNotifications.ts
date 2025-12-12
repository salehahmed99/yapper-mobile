import { useInfiniteQuery } from '@tanstack/react-query';
import { getNotifications } from '../services/notificationService';

export const useNotifications = () => {
  return useInfiniteQuery({
    queryKey: ['notifications'],
    queryFn: ({ pageParam }) => getNotifications({ page: pageParam }),
    getNextPageParam: (lastPage) => (lastPage.hasNext ? lastPage.page + 1 : undefined),
    initialPageParam: 1,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    staleTime: 5 * 60 * 1000, // Consider data stale after 5 minutes
    maxPages: 10, // Keep only last 10 pages in memory to prevent OOM
  });
};
