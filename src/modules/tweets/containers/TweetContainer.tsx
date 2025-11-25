import QueryWrapper from '@/src/components/QueryWrapper';
import { useAuthStore } from '@/src/store/useAuthStore';
import { router, useLocalSearchParams, useSegments } from 'expo-router';
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
      isVisible?: boolean;
      onOpenReplyModal?: (tweet: ITweet) => void;
      onOpenQuoteModal?: (tweet: ITweet) => void;
      onOpenRepostSheet?: (tweet: ITweet) => void;
    }
  | {
      tweet?: never;
      tweetId: string;
      isVisible?: boolean;
      onOpenReplyModal?: (tweet: ITweet) => void;
      onOpenQuoteModal?: (tweet: ITweet) => void;
      onOpenRepostSheet?: (tweet: ITweet) => void;
    };

const TweetContainer: React.FC<TweetContainerProps> = (props) => {
  const tweetQuery = useTweet(props.tweetId);
  const currentUser = useAuthStore((state) => state.user);
  const segments = useSegments();
  const params = useLocalSearchParams();
  const currentProfileId = (segments as string[]).includes('(profile)') ? params.id : null;

  const { likeMutation } = useTweetActions(props.tweetId ?? props.tweet.tweetId);

  const handleLike = (isLiked: boolean) => {
    const id = props.tweetId ?? props.tweet?.tweetId;
    if (id) {
      likeMutation.mutate({ tweetId: id, isLiked: isLiked });
    }
  };

  const handleTweetPress = (tweetId: string) => {
    router.push({
      pathname: '/(protected)/tweets/[tweetId]',
      params: {
        tweetId: tweetId,
      },
    });
  };

  const handleAvatarPress = (userId: string) => {
    // Don't navigate if already on this profile or if it's the current user's own profile
    const isCurrentProfile = userId === currentProfileId;
    const isOwnProfile = !currentProfileId && userId === currentUser?.id;
    if (!isCurrentProfile && !isOwnProfile) {
      router.push({ pathname: '/(protected)/(profile)/[id]', params: { id: userId } });
    }
  };

  const handleReplyPress = (tweet: ITweet) => {
    props.onOpenReplyModal?.(tweet);
  };

  const handleRepostSheetOpen = (tweet: ITweet) => {
    props.onOpenRepostSheet?.(tweet);
  };

  const handleViewPostInteractions = (tweetId: string, ownerId: string) => {
    // TODO: Implement view post interactions functionality
    router.push({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: tweetId,
        ownerId: ownerId,
      },
    });
  };

  const handleBookmark = () => {
    // TODO: Implement bookmark functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  if (props.tweetId) {
    return (
      <QueryWrapper query={tweetQuery}>
        {(fetchedTweet) => (
          <FullTweet
            tweet={fetchedTweet}
            onReplyPress={() => handleReplyPress(fetchedTweet)}
            onLike={handleLike}
            onViewPostInteractions={handleViewPostInteractions}
            onBookmark={handleBookmark}
            onShare={handleShare}
            openSheet={() => handleRepostSheetOpen(fetchedTweet)}
            onAvatarPress={handleAvatarPress}
          />
        )}
      </QueryWrapper>
    );
  }

  if (props.tweet)
    return (
      <Tweet
        tweet={props.tweet}
        onReplyPress={() => handleReplyPress(props.tweet)}
        onLike={handleLike}
        onViewPostInteractions={handleViewPostInteractions}
        onBookmark={handleBookmark}
        onShare={handleShare}
        openSheet={() => handleRepostSheetOpen(props.tweet)}
        isVisible={props.isVisible}
        onTweetPress={handleTweetPress}
        onAvatarPress={handleAvatarPress}
      />
    );
};

const arePropsEqual = (prevProps: TweetContainerProps, nextProps: TweetContainerProps) => {
  if (prevProps.tweetId && nextProps.tweetId) {
    return prevProps.tweetId === nextProps.tweetId;
  }

  if (prevProps.tweet && nextProps.tweet) {
    return (
      prevProps.tweet.tweetId === nextProps.tweet.tweetId &&
      prevProps.tweet.isLiked === nextProps.tweet.isLiked &&
      prevProps.tweet.isReposted === nextProps.tweet.isReposted &&
      prevProps.tweet.likesCount === nextProps.tweet.likesCount &&
      prevProps.tweet.repostsCount === nextProps.tweet.repostsCount &&
      prevProps.tweet.repliesCount === nextProps.tweet.repliesCount
    );
  }

  return false;
};

export default React.memo(TweetContainer, arePropsEqual);
