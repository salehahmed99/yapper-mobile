import HomeTabView from '@/src/components/home/HomeTabView';
import YapperLogo from '@/src/components/icons/YapperLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { useTweetsFiltersStore } from '@/src/modules/tweets/store/useTweetsFiltersStore';
import React from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  // Use a local index for the Home top tabs (For You / Following).
  // We intentionally do NOT write this into the global `activeTab` state
  // so the bottom navigation remains correctly highlighted when switching
  // between these inner tabs.
  const [homeIndex, setHomeIndex] = React.useState(0);

  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);
  const tweetsQuery = useTweets(tweetsFilters);

  // Flatten all pages of tweets into a single array
  const tweets = React.useMemo(() => {
    return tweetsQuery.data?.pages.flatMap((page) => page.tweets) ?? [];
  }, [tweetsQuery.data]);

  const onRefresh = React.useCallback(() => {
    tweetsQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tweetsQuery.refetch]);

  const onEndReached = React.useCallback(() => {
    if (tweetsQuery.hasNextPage && !tweetsQuery.isFetchingNextPage) {
      tweetsQuery.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tweetsQuery.hasNextPage, tweetsQuery.isFetchingNextPage, tweetsQuery.fetchNextPage]);

  const refreshControl = (
    <RefreshControl
      refreshing={tweetsQuery.isRefetching}
      onRefresh={onRefresh}
      tintColor={theme.colors.text.primary}
      colors={[theme.colors.text.primary]}
    />
  );

  // Render different content based on the selected tab
  const renderScene = () => {
    if (homeIndex === 0) {
      // For You tab
      return (
        <View style={styles.tweetContainer}>
          <TweetList
            data={tweets}
            refreshControl={refreshControl}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
            isLoading={tweetsQuery.isLoading}
            isFetchingNextPage={tweetsQuery.isFetchingNextPage}
          />
        </View>
      );
    } else {
      // Following tab
      return (
        <View style={styles.tweetContainer}>
          <View />
        </View>
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar
          children={<YapperLogo size={32} color={theme.colors.text.primary} />}
          tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
        />
      </View>
      {renderScene()}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    appBarWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    tweetContainer: {
      flex: 1,
    },
  });
