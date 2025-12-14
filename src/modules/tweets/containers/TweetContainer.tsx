import QueryWrapper from '@/src/components/QueryWrapper';
import { router, useLocalSearchParams, useSegments } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import FullTweet from '../components/FullTweet';
import TweetThread from '../components/TweetThread';
import { useTweet } from '../hooks/useTweet';
import { useTweetActions } from '../hooks/useTweetActions';
import { ITweet } from '../types';

type TweetContainerProps =
  | {
      tweet: ITweet;
      tweetId?: never;
      isVisible?: boolean;
      showThread: boolean;
    }
  | {
      tweet?: never;
      tweetId: string;
      isVisible?: boolean;
      showThread: boolean;
    };

const TweetContainer: React.FC<TweetContainerProps> = (props) => {
  const tweetId = props.tweetId ?? props.tweet.tweetId;
  const tweetQuery = useTweet(tweetId);
  const segments = useSegments();
  const params = useLocalSearchParams();
  const currentProfileId = (segments as string[]).includes('(profile)') ? params.id : null;
  const { t } = useTranslation();

  const { likeMutation, repostMutation, replyToPostMutation, quotePostMutation, bookmarkMutation, deletePostMutation } =
    useTweetActions();

  const handleReply = async (tweetId: string, content: string, mediaUris?: string[]) => {
    replyToPostMutation.mutate({ tweetId, content, mediaUris });
  };

  const handleLike = (tweetId: string, isLiked: boolean) => {
    likeMutation.mutate({ tweetId: tweetId, isLiked: isLiked });
  };
  const handleRepost = (tweetId: string, isReposted: boolean) => {
    repostMutation.mutate({ tweetId: tweetId, isReposted: isReposted });
  };
  const handleBookmark = (tweetId: string, isBookmarked: boolean) => {
    bookmarkMutation.mutate({ tweetId: tweetId, isBookmarked: isBookmarked });
  };

  const handleQuote = (tweetId: string, content: string, mediaUris?: string[]) => {
    quotePostMutation.mutate({ tweetId, content, mediaUris });
  };
  const handleDelete = (tweetId: string) => {
    deletePostMutation.mutate({ tweetId });
  };

  const handleDeletePress = (tweetId: string) => {
    Alert.alert(t('tweets.deleteConfirmation.title'), t('tweets.deleteConfirmation.message'), [
      {
        text: t('tweets.deleteConfirmation.cancel'),
        style: 'cancel',
      },
      {
        text: t('tweets.deleteConfirmation.delete'),
        style: 'destructive',
        onPress: () => handleDelete(tweetId),
      },
    ]);
  };

  const handleMentionPress = (username: string) => {
    router.push({
      pathname: '/(protected)/(profile)/[id]',
      params: {
        id: username,
      },
    });
  };

  const handleHashtagPress = (hashtag: string) => {
    router.push({
      pathname: '/(protected)/search/search-results',
      params: {
        query: hashtag,
      },
    });
  };

  const handleAvatarPress = (userId: string) => {
    // Don't navigate if already on this profile or if it's the current user's own profile
    const isCurrentProfile = userId === currentProfileId;
    if (!isCurrentProfile) {
      router.push({ pathname: '/(protected)/(profile)/[id]', params: { id: userId } });
    }
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

  const handleShare = () => {
    // TODO: Implement share functionality
  };

  if (props.tweetId) {
    return (
      <QueryWrapper query={tweetQuery}>
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
    );
  }

  if (props.tweet)
    return (
      <>
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
      </>
    );
};

export default TweetContainer;
