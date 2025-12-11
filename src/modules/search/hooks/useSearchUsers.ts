import { useInfiniteQuery } from '@tanstack/react-query';
import { searchUsers } from '../services/searchService';
import { mapSearchUserToUser } from '../types';

interface UseSearchUsersOptions {
  query: string;
  username?: string;
  limit?: number;
  enabled?: boolean;
}

export const useSearchUsers = (options: UseSearchUsersOptions) => {
  const { query, username, limit = 20, enabled = true } = options;

  const result = useInfiniteQuery({
    queryKey: ['searchUsers', query, username, limit],
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const response = await searchUsers({
        query,
        username,
        cursor: pageParam,
        limit,
      });

      // Map search users to IUser format
      return {
        ...response,
        data: {
          ...response.data,
          data: response.data.data.map(mapSearchUserToUser),
        },
      };
    },
    getNextPageParam: (lastPage) => lastPage.data.pagination.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: enabled && query.length > 0,
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    maxPages: 10,
  });

  return result;
};
