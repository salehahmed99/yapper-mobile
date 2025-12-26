import { useQuery } from '@tanstack/react-query';
import { getWhoToFollow } from '../services/exploreService';
import { IWhoToFollowResponse } from '../types';

export const whoToFollowKeys = {
  all: ['whoToFollow'] as const,
  list: () => [...whoToFollowKeys.all, 'list'] as const,
};

export const useWhoToFollow = () => {
  return useQuery<IWhoToFollowResponse>({
    queryKey: whoToFollowKeys.list(),
    queryFn: getWhoToFollow,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
