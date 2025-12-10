import { useInfiniteQuery } from '@tanstack/react-query';
import { getBookmarks } from '../services/tweetService';

interface IBookmarkFilters {
  limit?: number;
}

export const useBookmarks = (filters: IBookmarkFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ['bookmarks', filters],
    queryFn: ({ pageParam }) =>
      getBookmarks({
        ...filters,
        cursor: pageParam,
      }),
    getNextPageParam: (lastPage) => lastPage.pagination.nextCursor ?? undefined,
    initialPageParam: undefined as string | undefined,
    gcTime: 5 * 60 * 1000, // Cache for 5 minutes
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
  });
};
