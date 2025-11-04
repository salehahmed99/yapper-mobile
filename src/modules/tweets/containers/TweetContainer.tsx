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

  const shouldFetchParent = tweet.type === 'quote' && !!tweet.parent_tweet_id;
  const parentTweetQuery = useTweet(shouldFetchParent ? tweet.parent_tweet_id : undefined);

  const { likeMutation, repostMutation } = useTweetActions();

  const handleReplyPress = () => {
    // TODO: Implement reply functionality
  };

  const handleRepostPress = (isReposted: boolean) => {
    repostMutation.mutate({ tweet_id: tweet.tweet_id, is_reposted: isReposted });
  };

  const handleLikePress = (isLiked: boolean) => {
    likeMutation.mutate({ tweet_id: tweet.tweet_id, is_liked: isLiked });
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
