import { IUser } from '@/src/types/user';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { IExploreTrending, ITrendItem } from '../types';
import { useExploreData } from './useExploreData';
import { useTrends } from './useTrends';

export interface UseExploreReturn {
  // For You tab state (from react-query)
  exploreData: ReturnType<typeof useExploreData>['data'] | undefined;
  forYouLoading: boolean;
  forYouError: Error | null;
  refetchForYou: () => void;

  // Trending tabs state
  useTrendsHook: typeof useTrends;

  // Navigation handlers
  handleTrendingPress: (trending: IExploreTrending | ITrendItem) => void;
  handleUserPress: (user: IUser) => void;
  handleShowMoreUsers: () => void;
  handleCategoryShowMore: (categoryId: string, categoryName: string) => void;
}

const useExplore = (): UseExploreReturn => {
  const router = useRouter();

  // Use react-query for For You data
  const exploreQuery = useExploreData(true);

  // Navigation handlers
  const handleTrendingPress = useCallback(
    (trending: IExploreTrending | ITrendItem) => {
      const query = 'text' in trending ? trending.text : trending.hashtag;
      router.push({
        pathname: '/(protected)/search/search-results',
        params: { query },
      });
    },
    [router],
  );

  const handleUserPress = useCallback(
    (user: IUser) => {
      router.push({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: user.id },
      });
    },
    [router],
  );

  const handleShowMoreUsers = useCallback(() => {
    router.push('/(protected)/(explore)/who-to-follow' as any);
  }, [router]);

  const handleCategoryShowMore = useCallback(
    (categoryId: string, categoryName: string) => {
      router.push({
        pathname: '/(protected)/(explore)/category-posts' as any,
        params: { categoryId, categoryName },
      });
    },
    [router],
  );

  return {
    // For You tab (from react-query)
    exploreData: exploreQuery.data,
    forYouLoading: exploreQuery.isLoading,
    forYouError: exploreQuery.error,
    refetchForYou: exploreQuery.refetch,

    // Expose useTrends hook for tabs to use individually
    useTrendsHook: useTrends,

    // Navigation handlers
    handleTrendingPress,
    handleUserPress,
    handleShowMoreUsers,
    handleCategoryShowMore,
  };
};

export default useExplore;
