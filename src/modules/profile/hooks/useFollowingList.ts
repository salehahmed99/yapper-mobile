import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getFollowingList } from '../services/profileService';
import { IGetFollowingListParams, IGetFollowingListResponse } from '../types';

// Query key factory for following list
export const followingKeys = {
  all: ['following'] as const,
  lists: () => [...followingKeys.all, 'list'] as const,
  list: (params: IGetFollowingListParams) => [...followingKeys.lists(), params] as const,
};

interface UseFollowingListOptions
  extends Omit<UseQueryOptions<IGetFollowingListResponse, Error>, 'queryKey' | 'queryFn'> {
  userId: string;
  cursor?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Hook to fetch following list with React Query caching
 * @param options - Query options including userId and cursor pagination
 * @returns React Query result with following data, loading state, and error
 */
export const useFollowingList = ({
  userId,
  cursor = '',
  limit = 20,
  enabled = true,
  ...queryOptions
}: UseFollowingListOptions) => {
  const params: IGetFollowingListParams = {
    userId,
    cursor,
    limit,
  };

  return useQuery<IGetFollowingListResponse, Error>({
    queryKey: followingKeys.list(params),
    queryFn: () => getFollowingList(params),
    enabled: enabled && !!userId, // Only fetch if enabled and userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...queryOptions,
  });
};
