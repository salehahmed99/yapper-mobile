import QueryWrapper from '@/src/components/QueryWrapper';
import React from 'react';
import FullTweet from '../components/FullTweet';
import { useTweet } from '../hooks/useTweet';
import { useTweetActions } from '../hooks/useTweetActions';

interface ITweetContainerProps {
  tweetId: string;
}
const TweetContainer: React.FC<ITweetContainerProps> = (props) => {
  const { tweetId } = props;

  const tweetQuery = useTweet(tweetId);

  const { likeMutation, repostMutation } = useTweetActions(tweetId);

  const handleReplyPress = () => {
    // TODO: Implement reply functionality
  };

  const handleRepostPress = (isReposted: boolean) => {
    repostMutation.mutate({ isReposted: isReposted });
  };

  const handleLikePress = (isLiked: boolean) => {
    likeMutation.mutate({ isLiked: isLiked });
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

  return (
    <QueryWrapper query={tweetQuery}>
      {(tweet) => (
        <FullTweet
          tweet={tweet}
          onReplyPress={handleReplyPress}
          onRepostPress={handleRepostPress}
          onLikePress={handleLikePress}
          onViewsPress={handleViewsPress}
          onBookmarkPress={handleBookmarkPress}
          onSharePress={handleSharePress}
        />
      )}
    </QueryWrapper>
  );
};

export default TweetContainer;
