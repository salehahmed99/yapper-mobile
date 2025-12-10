import { useQuery } from '@tanstack/react-query';
import { getExploreData } from '../services/exploreService';
import { IExploreResponse } from '../types';

export const useExploreData = (enabled: boolean = true) => {
  return useQuery<IExploreResponse>({
    queryKey: ['explore', 'forYou'],
    queryFn: async () => {
      const response = await getExploreData();
      return response;
    },
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
