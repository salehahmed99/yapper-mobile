import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { getFollowersList } from '../services/profileService';
import { IGetFollowersListParams, IGetFollowersListResponse } from '../types';

export const followersKeys = {
  all: ['followers'] as const,
  lists: () => [...followersKeys.all, 'list'] as const,
  list: (params: IGetFollowersListParams) => [...followersKeys.lists(), params] as const,
};

interface UseFollowersListOptions
  extends Omit<UseQueryOptions<IGetFollowersListResponse, Error>, 'queryKey' | 'queryFn'> {
  userId: string;
  cursor?: string;
  limit?: number;
  following?: boolean;
  enabled?: boolean;
}
export const useFollowersList = ({
  userId,
  cursor = '',
  limit = 20,
  following = false,
  enabled = true,
  ...queryOptions
}: UseFollowersListOptions) => {
  const params: IGetFollowersListParams = {
    userId,
    cursor,
    limit,
    following,
  };

  return useQuery<IGetFollowersListResponse, Error>({
    queryKey: followersKeys.list(params),
    queryFn: () => getFollowersList(params),
    enabled: enabled && !!userId,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    ...queryOptions,
  });
};
