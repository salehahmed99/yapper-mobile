import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControlProps, StyleSheet, View, ViewToken } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TweetContainer from '../containers/TweetContainer';
import { ITweet } from '../types';

interface ITweetListProps {
  data: ITweet[];
  refreshControl?: React.ReactElement<RefreshControlProps>;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  isLoading?: boolean;
  isFetchingNextPage?: boolean;
  topSpacing?: number;
  bottomSpacing?: number;
}
const TweetList: React.FC<ITweetListProps> = (props) => {
  const {
    data,
    refreshControl,
    onEndReached,
    onEndReachedThreshold,
    isLoading,
    isFetchingNextPage,
    topSpacing = 0,
    bottomSpacing = 0,
  } = props;
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [visibleTweetIds, setVisibleTweetIds] = useState<Set<string>>(new Set());

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const visibleIds = new Set(
      viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweetId),
    );
    setVisibleTweetIds(visibleIds);
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 90, // Item is considered visible when 90% is in view
    waitForInteraction: false,
  }).current;

  const renderHeader = () => {
    if (topSpacing > 0) {
      return <View style={{ height: topSpacing }} />;
    }
    return null;
  };

  const renderFooter = () => {
    return (
      <View>
        {isFetchingNextPage && (
          <View style={styles.loadingFooter}>
            <ActivityIndicator size="small" color={theme.colors.text.primary} />
          </View>
        )}
        {bottomSpacing > 0 && <View style={{ height: bottomSpacing }} />}
      </View>
    );
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
      data={data}
      renderItem={({ item }) => <TweetContainer tweet={item} isVisible={visibleTweetIds.has(item.tweetId)} />}
      keyExtractor={(item, index) => {
        if (item.type === 'repost') {
          return `${item.tweetId}-${item.repostedBy?.repostId}-${index}`;
        } else {
          return `${item.tweetId}-${index}`;
        }
      }}
      scrollIndicatorInsets={{ top: topSpacing - insets.top, bottom: bottomSpacing - insets.bottom }}
      refreshControl={refreshControl}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      accessibilityLabel="tweet_list_feed"
      testID="tweet_list_feed"
      ListHeaderComponent={renderHeader}
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
