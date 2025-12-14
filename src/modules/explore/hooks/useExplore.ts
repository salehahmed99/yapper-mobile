import { useNavigation } from '@/src/hooks/useNavigation';
import { IUser } from '@/src/types/user';
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
  isRefetchingForYou: boolean;

  // Trending tabs state
  useTrendsHook: typeof useTrends;

  // Navigation handlers
  handleTrendingPress: (trending: IExploreTrending | ITrendItem) => void;
  handleUserPress: (user: IUser) => void;
  handleShowMoreUsers: () => void;
  handleCategoryShowMore: (categoryId: string, categoryName: string) => void;
}

const useExplore = (): UseExploreReturn => {
  const { navigate } = useNavigation();

  // Use react-query for For You data
  const exploreQuery = useExploreData(true);

  // Navigation handlers
  const handleTrendingPress = useCallback(
    (trending: IExploreTrending | ITrendItem) => {
      const query = 'text' in trending ? trending.text : trending.hashtag;
      navigate({
        pathname: '/(protected)/search/search-results' as any,
        params: { query },
      });
    },
    [navigate],
  );

  const handleUserPress = useCallback(
    (user: IUser) => {
      navigate({
        pathname: '/(protected)/(profile)/[id]',
        params: { id: user.id },
      });
    },
    [navigate],
  );

  const handleShowMoreUsers = useCallback(() => {
    navigate('/(protected)/(explore)/who-to-follow' as any);
  }, [navigate]);

  const handleCategoryShowMore = useCallback(
    (categoryId: string, categoryName: string) => {
      navigate({
        pathname: '/(protected)/(explore)/category-posts' as any,
        params: { categoryId, categoryName },
      });
    },
    [navigate],
  );

  return {
    // For You tab (from react-query)
    exploreData: exploreQuery.data,
    forYouLoading: exploreQuery.isLoading,
    forYouError: exploreQuery.error,
    refetchForYou: exploreQuery.refetch,
    isRefetchingForYou: exploreQuery.isRefetching,

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
