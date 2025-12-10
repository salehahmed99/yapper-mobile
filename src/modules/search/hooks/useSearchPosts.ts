import { useInfiniteQuery } from '@tanstack/react-query';
import { searchLatestPosts, searchPosts } from '../services/searchService';

type SearchPostsType = 'posts' | 'media' | 'latest';

interface UseSearchPostsOptions {
  query: string;
  type: SearchPostsType;
  username?: string;
  limit?: number;
  enabled?: boolean;
}

export const useSearchPosts = (options: UseSearchPostsOptions) => {
  const { query, type, username, limit = 20, enabled = true } = options;

  const queryFn = async ({ pageParam }: { pageParam?: string }) => {
    if (type === 'latest') {
      return searchLatestPosts({
        query,
        username,
        cursor: pageParam,
        limit,
      });
    }

    return searchPosts({
      query,
      username,
      cursor: pageParam,
      limit,
      hasMedia: type === 'media' ? true : undefined,
    });
  };

  return useInfiniteQuery({
    queryKey: ['searchPosts', type, query, username, limit],
    queryFn,
    getNextPageParam: (lastPage) => lastPage.data.pagination.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    maxPages: 10,
  });
};
