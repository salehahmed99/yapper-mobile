import HomeTabView from '@/src/components/home/HomeTabView';
import YapperLogo from '@/src/components/icons/YapperLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing from '@/src/hooks/useSpacing';
import CreatePostModal from '@/src/modules/tweets/components/CreatePostModal';
import Fab from '@/src/modules/tweets/components/Fab';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { useTweetsFiltersStore } from '@/src/modules/tweets/store/useTweetsFiltersStore';
import React, { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const { top, bottom } = useSpacing();
  const styles = createStyles(theme);
  // Use a local index for the Home top tabs (For You / Following).
  // We intentionally do NOT write this into the global `activeTab` state
  // so the bottom navigation remains correctly highlighted when switching
  // between these inner tabs.
  const [homeIndex, setHomeIndex] = useState(0);

  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);

  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);
  const forYouQuery = useTweets(tweetsFilters, 'for-you');
  const followingQuery = useTweets(tweetsFilters, 'following');

  // Select the active query based on tab index
  const activeQuery = homeIndex === 0 ? forYouQuery : followingQuery;

  // Flatten all pages of tweets into a single array
  // Only keep the last 50 tweets to prevent excessive memory usage
  const tweets = React.useMemo(() => {
    const allTweets = activeQuery.data?.pages.flatMap((page) => page.data) ?? [];
    // Keep only the last 50 tweets visible to prevent OOM issues with large scrolled lists
    return allTweets.length > 50 ? allTweets.slice(-50) : allTweets;
  }, [activeQuery.data]);

  const onRefresh = React.useCallback(() => {
    activeQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery.refetch]);

  const onEndReached = React.useCallback(() => {
    if (activeQuery.hasNextPage && !activeQuery.isFetchingNextPage) {
      activeQuery.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuery.hasNextPage, activeQuery.isFetchingNextPage, activeQuery.fetchNextPage]);

  const refreshControl = (
    <RefreshControl
      refreshing={activeQuery.isRefetching}
      onRefresh={onRefresh}
      tintColor={theme.colors.text.primary}
      colors={[theme.colors.text.primary]}
    />
  );

  // Render different content based on the selected tab
  const renderScene = () => {
    return (
      <View style={styles.tweetContainer}>
        <TweetList
          data={tweets}
          refreshControl={refreshControl}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.5}
          isLoading={activeQuery.isLoading}
          isFetchingNextPage={activeQuery.isFetchingNextPage}
          topSpacing={top}
          bottomSpacing={bottom}
        />
      </View>
    );
  };

  const { addPostMutation } = useTweetActions('dummyId');
  return (
    <View style={styles.container}>
      <MediaViewerProvider>
        <View style={styles.appBarWrapper}>
          <AppBar
            children={<YapperLogo size={32} color={theme.colors.text.primary} />}
            tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
          />
        </View>
        <MediaViewerModal />
        {renderScene()}
        <Fab onPress={() => setIsCreatePostModalVisible(true)} />
        <CreatePostModal
          visible={isCreatePostModalVisible}
          onClose={() => setIsCreatePostModalVisible(false)}
          onPost={(content, mediaUris) => addPostMutation.mutate({ content, mediaUris })}
          type="tweet"
        />
      </MediaViewerProvider>
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
