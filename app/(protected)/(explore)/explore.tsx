import CustomTabView from '@/src/components/CustomTabView';
import AppBar from '@/src/components/shell/AppBar';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import { useSwipeableTabsGeneric } from '@/src/hooks/useSwipeableTabsGeneric';
import ForYouContent from '@/src/modules/explore/components/ForYouContent';
import TrendingList from '@/src/modules/explore/components/TrendingList';
import useExplore, { UseExploreReturn } from '@/src/modules/explore/hooks/useExplore';
import { useTrends } from '@/src/modules/explore/hooks/useTrends';
import { ExploreTab } from '@/src/modules/explore/types';
import ExploreSearchBar from '@/src/modules/search/components/ExploreSearchBar';
import React, { createContext, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, View } from 'react-native';

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
    refetchForYou,
    isRefetchingForYou,
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
      refreshing={isRefetchingForYou}
      onRefresh={refetchForYou}
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
    const { data, isLoading, refetch, isRefetching } = useTrends(tab, isActive);

    const trends = data?.data?.data || [];

    return (
      <TrendingList
        trends={trends}
        loading={isLoading && isActive}
        refreshing={isRefetching}
        onRefresh={refetch}
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
  const { top, bottom } = useSpacing();

  // Use the explore hook for all state and logic
  const exploreState = useExplore();
  const { t } = useTranslation();

  const [activeIndex, setActiveIndex] = useState(0);

  const contextValue = useMemo(() => exploreState, [exploreState]);

  const routes = useMemo(
    () => [
      { key: 'forYou', title: t('explore.tabs.forYou', 'For You') },
      { key: 'trending', title: t('explore.tabs.trending', 'Trending') },
      { key: 'news', title: t('explore.tabs.news', 'News') },
      { key: 'sports', title: t('explore.tabs.sports', 'Sports') },
      { key: 'entertainment', title: t('explore.tabs.entertainment', 'Entertainment') },
    ],
    [t],
  );

  const activeTabKey = routes[activeIndex]?.key;

  const { translateX, panResponder, screenWidth } = useSwipeableTabsGeneric({
    tabCount: routes.length,
    currentIndex: activeIndex,
    onIndexChange: setActiveIndex,
    swipeEnabled: true,
  });

  return (
    <ExploreContext.Provider value={contextValue}>
      <View style={styles.container}>
        <View style={styles.appBarWrapper}>
          <AppBar
            children={<ExploreSearchBar />}
            tabView={
              <CustomTabView routes={routes} index={activeIndex} onIndexChange={setActiveIndex} scrollable={true} />
            }
            hideRightElement={true}
          />
        </View>
        <View style={styles.tabsOuterContainer} {...panResponder.panHandlers}>
          <Animated.View
            style={[styles.tabsInnerContainer, { width: screenWidth * routes.length, transform: [{ translateX }] }]}
          >
            <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
              <ForYouTab activeTabKey={activeTabKey} />
            </View>
            <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
              <TrendingTab activeTabKey={activeTabKey} />
            </View>
            <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
              <NewsTab activeTabKey={activeTabKey} />
            </View>
            <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
              <SportsTab activeTabKey={activeTabKey} />
            </View>
            <View style={[styles.tabPage, { width: screenWidth, paddingTop: top }]}>
              <EntertainmentTab activeTabKey={activeTabKey} />
            </View>
          </Animated.View>
        </View>
        <View style={{ height: bottom }} />
      </View>
    </ExploreContext.Provider>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background.primary },
    appBarWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    tabsOuterContainer: {
      flex: 1,
      overflow: 'hidden',
    },
    tabsInnerContainer: {
      flex: 1,
      flexDirection: 'row',
    },
    tabPage: {
      flex: 1,
    },
  });
