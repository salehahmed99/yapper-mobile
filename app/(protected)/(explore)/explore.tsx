import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import ForYouContent from '@/src/modules/explore/components/ForYouContent';
import TrendingList from '@/src/modules/explore/components/TrendingList';
import useExplore, { UseExploreReturn } from '@/src/modules/explore/hooks/useExplore';
import { useTrends } from '@/src/modules/explore/hooks/useTrends';
import { ExploreTab } from '@/src/modules/explore/types';
import CustomTabView, { TabConfig } from '@/src/modules/profile/components/CustomTabView';
import ExploreSearchBar from '@/src/modules/search/components/ExploreSearchBar';
import React, { createContext, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

// Context for sharing explore data with tab components
type ExploreContextType = UseExploreReturn;

const ExploreContext = createContext<ExploreContextType | null>(null);

const useExploreContext = () => {
  const context = useContext(ExploreContext);
  if (!context) throw new Error('useExploreContext must be used within ExploreProvider');
  return context;
};

// Stable tab components defined outside - won't be recreated
const ForYouTab: React.FC<{ activeTabKey?: string }> = ({ activeTabKey }) => {
  const {
    exploreData,
    forYouLoading,
    handleTrendingPress,
    handleUserPress,
    handleShowMoreUsers,
    handleCategoryShowMore,
  } = useExploreContext();

  const isActive = activeTabKey === 'forYou';

  return (
    <ForYouContent
      trending={exploreData?.data?.trending?.data || []}
      whoToFollow={exploreData?.data?.whoToFollow || []}
      forYouPosts={exploreData?.data?.forYou || []}
      loading={forYouLoading && isActive}
      onTrendingPress={handleTrendingPress}
      onUserPress={handleUserPress}
      onShowMoreUsers={handleShowMoreUsers}
      onCategoryShowMore={handleCategoryShowMore}
    />
  );
};

// Generic trending tab component using useTrends hook
const createTrendingTab = (tab: ExploreTab, emptyMessageKey: string, defaultMessage: string) => {
  const TrendingTabComponent: React.FC<{ activeTabKey?: string }> = ({ activeTabKey }) => {
    const { handleTrendingPress } = useExploreContext();
    const { t } = useTranslation();
    const isActive = activeTabKey === tab;
    const { data, isLoading } = useTrends(tab, isActive);

    const trends = data?.data?.data || [];

    return (
      <TrendingList
        trends={trends}
        loading={isLoading && isActive}
        onTrendingPress={handleTrendingPress}
        emptyMessage={t(emptyMessageKey, defaultMessage)}
      />
    );
  };
  return TrendingTabComponent;
};

const TrendingTab = createTrendingTab('trending', 'explore.noTrending', 'No trending topics');
const NewsTab = createTrendingTab('news', 'explore.noNews', 'No news topics');
const SportsTab = createTrendingTab('sports', 'explore.noSports', 'No sports topics');
const EntertainmentTab = createTrendingTab('entertainment', 'explore.noEntertainment', 'No entertainment topics');

export default function ExplorePage() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { bottom } = useSpacing();

  // Use the explore hook for all state and logic
  const exploreState = useExplore();
  const { t } = useTranslation();

  const contextValue = useMemo(() => exploreState, [exploreState]);

  const tabs: TabConfig[] = useMemo(
    () => [
      { key: 'forYou', title: t('explore.tabs.forYou', 'For You'), component: ForYouTab },
      { key: 'trending', title: t('explore.tabs.trending', 'Trending'), component: TrendingTab },
      { key: 'news', title: t('explore.tabs.news', 'News'), component: NewsTab },
      { key: 'sports', title: t('explore.tabs.sports', 'Sports'), component: SportsTab },
      { key: 'entertainment', title: t('explore.tabs.entertainment', 'Entertainment'), component: EntertainmentTab },
    ],
    [t],
  );

  return (
    <ExploreContext.Provider value={contextValue}>
      <View style={styles.container}>
        <ExploreSearchBar />
        <CustomTabView tabs={tabs} scrollEnabled={true} lazy={false} />
        <View style={{ height: bottom }} />
      </View>
    </ExploreContext.Provider>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
  });
