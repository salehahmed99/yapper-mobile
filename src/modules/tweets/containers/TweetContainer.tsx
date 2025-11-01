import QueryWrapper from '@/src/components/QueryWrapper';
import React from 'react';
import Tweet from '../components/Tweet';
import { useTweet } from '../hooks/useTweet';
import { useTweetActions } from '../hooks/useTweetActions';
import { ITweet } from '../types';

interface ITweetContainerProps {
  tweet: ITweet;
}
const TweetContainer: React.FC<ITweetContainerProps> = (props) => {
  const { tweet } = props;

  const shouldFetchParent = tweet.type === 'quote' && !!tweet.parentTweetId;
  const parentTweetQuery = useTweet(shouldFetchParent ? tweet.parentTweetId : undefined);

  const { likeMutation, repostMutation } = useTweetActions();

  const handleReplyPress = () => {
    // TODO: Implement reply functionality
  };

  const handleRepostPress = (isReposted: boolean) => {
    repostMutation.mutate({ tweetId: tweet.tweetId, isReposted });
  };

  const handleLikePress = (isLiked: boolean) => {
    likeMutation.mutate({ tweetId: tweet.tweetId, isLiked });
  };

  const handleViewsPress = () => {
    // TODO: Implement views functionality
  };

  const handleBookmarkPress = () => {
    // TODO: Implement bookmark functionality
  };

  const handleSharePress = () => {
    // TODO: Implement share functionality
  };

  return shouldFetchParent ? (
    <QueryWrapper query={parentTweetQuery}>
      {(parentTweet) => (
        <Tweet
          tweet={tweet}
          parentTweet={parentTweet}
          onReplyPress={handleReplyPress}
          onRepostPress={handleRepostPress}
          onLikePress={handleLikePress}
          onViewsPress={handleViewsPress}
          onBookmarkPress={handleBookmarkPress}
          onSharePress={handleSharePress}
        />
      )}
    </QueryWrapper>
  ) : (
    <Tweet
      tweet={tweet}
      onReplyPress={handleReplyPress}
      onRepostPress={handleRepostPress}
      onLikePress={handleLikePress}
      onViewsPress={handleViewsPress}
      onBookmarkPress={handleBookmarkPress}
      onSharePress={handleSharePress}
    />
  );
};

export default TweetContainer;
