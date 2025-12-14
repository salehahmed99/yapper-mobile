import useMargins from '@/src/hooks/useSpacing';
import React, { useCallback, useMemo } from 'react';
import TweetList from '../components/TweetList';
import { useReplies } from '../hooks/useReplies';
import TweetContainer from './TweetContainer';

const RepliesContainer = ({ tweetId }: { tweetId: string }) => {
  const repliesQuery = useReplies(tweetId);

  const { bottom } = useMargins();
  // Flatten all pages of tweets into a single array
  const replies = useMemo(() => {
    const allTweets = repliesQuery.data?.pages.flatMap((page) => page.data) ?? [];
    return allTweets;
  }, [repliesQuery.data]);

  const onRefresh = useCallback(() => {
    repliesQuery.refetch();
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
      listHeaderComponent={<TweetContainer tweetId={tweetId} showThread={false} />}
    />
  );
};

export default RepliesContainer;
