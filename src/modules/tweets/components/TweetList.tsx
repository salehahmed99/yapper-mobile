import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useSpacing, { useSpacingWithoutSafeArea } from '@/src/hooks/useSpacing';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useCallback, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControlProps, StyleSheet, View, ViewToken } from 'react-native';
import TweetContainer from '../containers/TweetContainer';
import { useTweetActions } from '../hooks/useTweetActions';
import { ITweet } from '../types';
import CreatePostModal from './CreatePostModal';
import RepostOptionsModal from './RepostOptionsModal';

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

  // Centralized modal state
  const [activeTweet, setActiveTweet] = useState<ITweet | null>(null);
  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
  const [createPostType, setCreatePostType] = useState<'tweet' | 'quote' | 'reply'>('tweet');
  const bottomSheetModalRef = useRef<BottomSheetModal>(null);

  // Tweet actions for the active tweet
  const { repostMutation, replyToPostMutation, quotePostMutation } = useTweetActions(activeTweet?.tweetId ?? '');

  // Modal handlers
  const handleOpenReplyModal = useCallback((tweet: ITweet) => {
    setActiveTweet(tweet);
    setCreatePostType('reply');
    setIsCreatePostModalVisible(true);
  }, []);

  const handleOpenQuoteModal = useCallback((tweet: ITweet) => {
    setActiveTweet(tweet);
    setCreatePostType('quote');
    setIsCreatePostModalVisible(true);
  }, []);

  const handleOpenRepostSheet = useCallback((tweet: ITweet) => {
    setActiveTweet(tweet);
    bottomSheetModalRef.current?.present();
  }, []);

  const handleReply = useCallback(
    async (content: string, mediaUris?: string[]) => {
      replyToPostMutation.mutate({ content, mediaUris });
    },
    [replyToPostMutation],
  );

  const handleQuote = useCallback(
    (content: string, mediaUris?: string[]) => {
      quotePostMutation.mutate({ content, mediaUris });
    },
    [quotePostMutation],
  );

  const handleRepost = useCallback(
    (isReposted: boolean) => {
      if (activeTweet) {
        repostMutation.mutate({ tweetId: activeTweet.tweetId, isReposted });
      }
    },
    [activeTweet, repostMutation],
  );

  const handleViewPostInteractions = useCallback((_tweetId: string, _ownerId: string) => {
    // This will be handled by TweetContainer
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    // Track visible items for potential future use
    const _visibleIds = new Set(
      viewableItems.filter((item) => item.isViewable).map((item) => (item.item as ITweet).tweetId),
    );
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50, // Item is considered visible when 50% is in view
    waitForInteraction: false,
  }).current;

  const { top, bottom } = useSpacing();
  const { top: topWithoutSafeArea, bottom: bottomWithoutSafeArea } = useSpacingWithoutSafeArea();

  const renderItem = useCallback(
    ({ item }: { item: ITweet }) => (
      <TweetContainer
        tweet={item}
        isVisible={true}
        onOpenReplyModal={handleOpenReplyModal}
        onOpenQuoteModal={handleOpenQuoteModal}
        onOpenRepostSheet={handleOpenRepostSheet}
      />
    ),
    [handleOpenReplyModal, handleOpenQuoteModal, handleOpenRepostSheet],
  );

  const keyExtractor = useCallback((item: ITweet, index: number) => {
    if (item.type === 'repost') {
      return `${item.tweetId}-${item.repostedBy?.repostId}-${index}`;
    } else {
      return `${item.tweetId}-${index}`;
    }
  }, []);

  const ItemSeparator = useCallback(() => <View style={styles.separator} />, [styles.separator]);

  const getItemLayout = useCallback(
    (_data: ArrayLike<ITweet> | null | undefined, index: number) => ({
      length: 150, // Approximate height of a tweet item
      offset: 150 * index,
      index,
    }),
    [],
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View style={{ ...styles.loadingFooter, paddingBottom: bottom }}>
          <ActivityIndicator size="small" color={theme.colors.text.primary} />
        </View>
      );
    }
    return <View style={{ height: bottom }}></View>;
  }, [isFetchingNextPage, bottom, styles.loadingFooter, theme.colors.text.primary]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.text.primary} />
      </View>
    );
  }

  return (
    <>
      <FlatList
        style={styles.flatList}
        contentInset={{ top, bottom: 0 }}
        contentOffset={{ x: 0, y: -top }}
        data={data}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollIndicatorInsets={{ top: topWithoutSafeArea, bottom: bottomWithoutSafeArea }}
        refreshControl={refreshControl}
        ItemSeparatorComponent={ItemSeparator}
        getItemLayout={getItemLayout}
        accessibilityLabel="tweet_list_feed"
        testID="tweet_list_feed"
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
      {activeTweet && (
        <>
          <CreatePostModal
            visible={isCreatePostModalVisible}
            onClose={() => setIsCreatePostModalVisible(false)}
            type={createPostType}
            tweet={activeTweet}
            onPost={createPostType === 'reply' ? handleReply : handleQuote}
            onRepost={() => handleRepost(activeTweet.isReposted)}
          />

          <RepostOptionsModal
            isReposted={activeTweet.isReposted}
            onRepostPress={() => handleRepost(activeTweet.isReposted)}
            onQuotePress={() => handleOpenQuoteModal(activeTweet)}
            onViewInteractionsPress={() => handleViewPostInteractions(activeTweet.tweetId, activeTweet.user.id)}
            bottomSheetModalRef={bottomSheetModalRef}
          />
        </>
      )}
    </>
  );
};

export default TweetList;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    flatList: {
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
    },
    loadingFooter: {
      alignItems: 'center',
    },
  });
