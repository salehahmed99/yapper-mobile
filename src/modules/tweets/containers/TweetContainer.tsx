import QueryWrapper from '@/src/components/QueryWrapper';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import React from 'react';
import FullTweet from '../components/FullTweet';
import Tweet from '../components/Tweet';
import { useTweet } from '../hooks/useTweet';
import { useTweetActions } from '../hooks/useTweetActions';
import { ITweet } from '../types';

type TweetContainerProps =
  | {
      tweet: ITweet;
      tweetId?: never;
    }
  | {
      tweet?: never;
      tweetId: string;
    };

const TweetContainer: React.FC<TweetContainerProps> = (props) => {
  const tweetQuery = useTweet(props.tweetId);

  const { likeMutation, repostMutation } = useTweetActions(props.tweetId ?? props.tweet.tweetId);

  const handleReplyPress = () => {
    // TODO: Implement reply functionality
  };

  const handleRepostPress = (isReposted: boolean) => {
    repostMutation.mutate({ isReposted: isReposted });
  };

  const handleQuotePress = () => {
    // TODO: Implement quote functionality
  };

  const handleLikePress = (isLiked: boolean) => {
    likeMutation.mutate({ isLiked: isLiked });
  };

  const handleViewsPress = () => {
    // TODO: Implement views functionality
  };

  const handleViewPostInteractionsPress = (tweetId: string, ownerId: string) => {
    // TODO: Implement view post interactions functionality
    router.push({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: tweetId,
        ownerId: ownerId,
      },
    });
  };

  const handleBookmarkPress = () => {
    // TODO: Implement bookmark functionality
  };

  const handleSharePress = () => {
    // TODO: Implement share functionality
  };

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const openSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  if (props.tweetId) {
    return (
      <QueryWrapper query={tweetQuery}>
        {(fetchedTweet) => (
          <FullTweet
            tweet={fetchedTweet}
            onReplyPress={handleReplyPress}
            onRepostPress={handleRepostPress}
            onQuotePress={handleQuotePress}
            onLikePress={handleLikePress}
            onViewsPress={handleViewsPress}
            onViewPostInteractionsPress={handleViewPostInteractionsPress}
            onBookmarkPress={handleBookmarkPress}
            onSharePress={handleSharePress}
            bottomSheetModalRef={bottomSheetModalRef}
            openSheet={openSheet}
          />
        )}
      </QueryWrapper>
    );
  }

  if (props.tweet)
    return (
      <Tweet
        tweet={props.tweet}
        onReplyPress={handleReplyPress}
        onRepostPress={handleRepostPress}
        onQuotePress={handleQuotePress}
        onLikePress={handleLikePress}
        onViewsPress={handleViewsPress}
        onViewPostInteractionsPress={handleViewPostInteractionsPress}
        onBookmarkPress={handleBookmarkPress}
        onSharePress={handleSharePress}
        bottomSheetModalRef={bottomSheetModalRef}
        openSheet={openSheet}
      />
    );
};

export default TweetContainer;
