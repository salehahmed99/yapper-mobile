import HomeTabView from '@/src/components/home/HomeTabView';
import YapperLogo from '@/src/components/icons/YapperLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import CreatePostModal from '@/src/modules/tweets/components/CreatePostModal';
import Fab from '@/src/modules/tweets/components/Fab';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useTweetActions } from '@/src/modules/tweets/hooks/useTweetActions';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { useTweetsFiltersStore } from '@/src/modules/tweets/store/useTweetsFiltersStore';
import React, { useState } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
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
  const tweets = React.useMemo(() => {
    return activeQuery.data?.pages.flatMap((page) => page.tweets) ?? [];
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
        />
      </View>
    );
  };

  const { addPostMutation } = useTweetActions('dummyId');
  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar
          children={<YapperLogo size={32} color={theme.colors.text.primary} />}
          tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
        />
      </View>
      {renderScene()}
      <Fab onPress={() => setIsCreatePostModalVisible(true)} />
      <CreatePostModal
        visible={isCreatePostModalVisible}
        onClose={() => setIsCreatePostModalVisible(false)}
        onPost={(content) => addPostMutation.mutate(content)}
        type="tweet"
      />
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
