import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import TweetContainer from '@/src/modules/tweets/containers/TweetContainer';
import { ITweet } from '@/src/modules/tweets/types';
import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View, ViewToken } from 'react-native';

interface IProfilePostsListProps {
  data: ITweet[];
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  onEndReached?: () => void;
  isTabActive?: boolean;
}

const ProfilePostsList: React.FC<IProfilePostsListProps> = memo((props) => {
  const { data, isLoading, isFetchingNextPage, onEndReached, isTabActive = true } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<string>>(new Set());
  const isTabActiveRef = useRef(isTabActive);

  // Keep ref updated
  useEffect(() => {
    isTabActiveRef.current = isTabActive;
  }, [isTabActive]);

  // Clear visible tweets when tab becomes inactive to pause all videos
  useEffect(() => {
    if (!isTabActive) {
      setVisibleTweetIds(new Set());
    }
  }, [isTabActive]);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Only update visible tweets if tab is active
    if (isTabActiveRef.current) {
      const visibleIds = new Set(
        viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweetId),
      );
      setVisibleTweetIds(visibleIds);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
    waitForInteraction: false,
  }).current;

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter} testID="profile_posts_list_loading_more">
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      );
    }
    return <View style={styles.bottomSpacing} />;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer} testID="profile_posts_list_loading">
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  // Don't render FlatList at all when tab is inactive to prevent video playback
  if (!isTabActive) {
    return <View style={styles.container} />;
  }

  return (
    <FlatList
      style={styles.container}
      data={data}
      renderItem={({ item }) => (
        <TweetContainer tweet={item} isVisible={isTabActive && visibleTweetIds.has(item.tweetId)} />
      )}
      keyExtractor={(item, index) => {
        if (item.type === 'repost') {
          return `${item.tweetId}-${item.repostedBy?.repostId}-${index}`;
        } else {
          return `${item.tweetId}-${index}`;
        }
      }}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      ListFooterComponent={renderFooter}
      testID="profile_posts_list_container"
      removeClippedSubviews={true}
      windowSize={5}
      maxToRenderPerBatch={5}
      initialNumToRender={8}
      updateCellsBatchingPeriod={50}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
    />
  );
});

ProfilePostsList.displayName = 'ProfilePostsList';

export default ProfilePostsList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 40,
    },
    loadingFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    bottomSpacing: {
      height: 100,
    },
  });
