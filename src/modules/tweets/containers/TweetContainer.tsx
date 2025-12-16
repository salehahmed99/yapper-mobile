import React from 'react';
import TweetThread from '../components/TweetThread';
import useTweetUtils from '../hooks/useTweetUtils';
import { ITweet } from '../types';

type TweetContainerProps = {
  tweet: ITweet;
  isVisible?: boolean;
  showThread: boolean;
};

const TweetContainer: React.FC<TweetContainerProps> = (props) => {
  const {
    handleDeletePress,
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

  return (
    <TweetThread
      tweet={props.tweet}
      onDeletePress={handleDeletePress}
      onAvatarPress={handleAvatarPress}
      onReply={handleReply}
      onQuote={handleQuote}
      onRepost={handleRepost}
      onLike={handleLike}
      onBookmark={handleBookmark}
      onViewPostInteractions={handleViewPostInteractions}
      onShare={handleShare}
      isVisible={props.isVisible}
      showThread={props.showThread}
      onMentionPress={handleMentionPress}
      onHashtagPress={handleHashtagPress}
    />
  );
};

export default TweetContainer;
