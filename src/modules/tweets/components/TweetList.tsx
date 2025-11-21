import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing, { useSpacingWithoutSafeArea } from '@/src/hooks/useSpacing';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControlProps, StyleSheet, View, ViewToken } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { ITweet } from '../types';

interface ITweetListProps {
  data: ITweet[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
}
const TweetList: React.FC<ITweetListProps> = (props) => {
  const { data, refreshControl, onEndReached, onEndReachedThreshold, isLoading, isFetchingNextPage } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = new Set(
      viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweetId),
    );
    setVisibleTweetIds(visibleIds);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is in view
    waitForInteraction: false,
  }).current;

  const { top, bottom } = useSpacing();
  const { top: topWithoutSafeArea, bottom: bottomWithoutSafeArea } = useSpacingWithoutSafeArea();

  const renderFooter = () => {
    if (isFetchingNextPage) {
      return (
        <View style={styles.loadingFooter}>
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      );
    }
    return <View style={{ height: bottom }}></View>;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  return (
    <FlatList
      style={{ flex: 1 }}
      contentInset={{ top, bottom: 0 }}
      contentOffset={{ x: 0, y: -top }}
      data={data}
      renderItem={({ item }) => <TweetContainer tweet={item} isVisible={visibleTweetIds.has(item.tweetId)} />}
      keyExtractor={(item, index) => {
        if (item.type === 'repost') {
          return `${item.tweetId}-${item.repostedBy?.repostId}-${index}`;
        } else {
          return `${item.tweetId}-${index}`;
        }
      }}
      scrollIndicatorInsets={{ top: topWithoutSafeArea, bottom: bottomWithoutSafeArea }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="tweet_list_feed"
      ListFooterComponent={renderFooter}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold ?? 0.5}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 10,
      }}
      removeClippedSubviews={true}
      windowSize={5}
      maxToRenderPerBatch={5}
      initialNumToRender={8}
      updateCellsBatchingPeriod={50}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      // persistentScrollbar={true}
    />
  );
};

export default TweetList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    separator: {
      height: 1,
      backgroundColor: theme.colors.border,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
  });
