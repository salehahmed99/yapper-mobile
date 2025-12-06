import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getFollowingList } from '../services/profileService';
import { IGetFollowingListParams, IGetFollowingListResponse } from '../types';
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
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...queryOptions,
  });
};
