import QueryWrapper from '@/src/components/QueryWrapper';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useMargins from '@/src/hooks/useSpacing';
import React, { useCallback, useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import FullTweet from '../components/FullTweet';
import TweetList from '../components/TweetList';
import { useReplies } from '../hooks/useReplies';
import { useTweet } from '../hooks/useTweet';
import useTweetUtils from '../hooks/useTweetUtils';

const FullTweetContainer = ({ tweetId }: { tweetId: string }) => {
  const repliesQuery = useReplies(tweetId);
  const tweetQuery = useTweet(tweetId);

  const {
    handleAvatarPress,
    handleReply,
    handleQuote,
    handleRepost,
    handleLike,
    handleBookmark,
    handleViewPostInteractions,
    handleShare,
    handleMentionPress,
    handleHashtagPress,
  } = useTweetUtils();
  const { bottom } = useMargins();
  // Flatten all pages of tweets into a single array
  const replies = useMemo(() => {
    const allTweets = repliesQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return allTweets;
  }, [repliesQuery.data]);

  const onRefresh = useCallback(() => {
    repliesQuery.refetch();
    tweetQuery.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliesQuery.refetch]);

  const onEndReached = useCallback(() => {
    if (repliesQuery.hasNextPage && !repliesQuery.isFetchingNextPage) {
      repliesQuery.fetchNextPage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repliesQuery.hasNextPage, repliesQuery.isFetchingNextPage, repliesQuery.fetchNextPage]);

  return (
    <TweetList
      data={replies}
      onRefresh={onRefresh}
      refreshing={repliesQuery.isRefetching}
      onEndReached={onEndReached}
      onEndReachedThreshold={0.5}
      isLoading={repliesQuery.isLoading}
      isFetchingNextPage={repliesQuery.isFetchingNextPage}
      topSpacing={0}
      bottomSpacing={bottom}
      listHeaderComponent={
        <QueryWrapper query={tweetQuery} errorComponent={<TweetNotFound />}>
          {(fetchedTweet) => (
            <>
              <FullTweet
                tweet={fetchedTweet}
                onAvatarPress={handleAvatarPress}
                onReply={handleReply}
                onQuote={handleQuote}
                onRepost={handleRepost}
                onLike={handleLike}
                onBookmark={handleBookmark}
                onViewPostInteractions={handleViewPostInteractions}
                onShare={handleShare}
                onMentionPress={handleMentionPress}
                onHashtagPress={handleHashtagPress}
              />
            </>
          )}
        </QueryWrapper>
      }
    />
  );
};

export default FullTweetContainer;

const TweetNotFound: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Tweet Not Found</Text>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background.primary,
    },
    text: {
      color: theme.colors.text.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
