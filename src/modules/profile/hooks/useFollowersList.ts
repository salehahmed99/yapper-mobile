import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getFollowersList } from '../services/profileService';
import { IGetFollowersListParams, IGetFollowersListResponse } from '../types';

// Query key factory for followers list
export const followersKeys = {
  all: ['followers'] as const,
  lists: () => [...followersKeys.all, 'list'] as const,
  list: (params: IGetFollowersListParams) => [...followersKeys.lists(), params] as const,
};

interface UseFollowersListOptions
  extends Omit<UseQueryOptions<IGetFollowersListResponse, Error>, 'queryKey' | 'queryFn'> {
  userId: string;
  pageOffset?: number;
  pageSize?: number;
  following?: boolean;
  enabled?: boolean;
}

/**
 * Hook to fetch followers list with React Query caching
 * @param options - Query options including userId, pagination, and filters
 * @returns React Query result with followers data, loading state, and error
 */
export const useFollowersList = ({
  userId,
  pageOffset = 1,
  pageSize = 20,
  following = false,
  enabled = true,
  ...queryOptions
}: UseFollowersListOptions) => {
  const params: IGetFollowersListParams = {
    userId,
    pageOffset,
    pageSize,
    following,
  };

  return useQuery<IGetFollowersListResponse, Error>({
    queryKey: followersKeys.list(params),
    queryFn: () => getFollowersList(params),
    enabled: enabled && !!userId, // Only fetch if enabled and userId exists
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    ...queryOptions,
  });
};
