import QueryWrapper from '@/src/components/QueryWrapper';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams, useSegments } from 'expo-router';
import React, { useState } from 'react';
import { Alert } from 'react-native';
import CreatePostModal from '../components/CreatePostModal';
import FullTweet from '../components/FullTweet';
import RepostOptionsModal from '../components/RepostOptionsModal';
import Tweet from '../components/Tweet';
import { useTweet } from '../hooks/useTweet';
import { useTweetActions } from '../hooks/useTweetActions';
import { ITweet } from '../types';

type TweetContainerProps =
  | {
      tweet: ITweet;
      tweetId?: never;
      isVisible?: boolean;
      quotedTweet?: ITweet;
    }
  | {
      tweet?: never;
      tweetId: string;
      isVisible?: boolean;
      quotedTweet?: ITweet;
    };

const TweetContainer: React.FC<TweetContainerProps> = (props) => {
  const tweetId = props.tweetId ?? props.tweet.tweetId;
  const tweetQuery = useTweet(tweetId);
  const currentUser = useAuthStore((state) => state.user);
  const segments = useSegments();
  const params = useLocalSearchParams();
  const currentProfileId = (segments as string[]).includes('(profile)') ? params.id : null;

  const { likeMutation, repostMutation, replyToPostMutation, quotePostMutation, bookmarkMutation, deletePostMutation } =
    useTweetActions(tweetId);

  const handleReply = async (content: string, mediaUris?: string[]) => {
    replyToPostMutation.mutate({ content, mediaUris });
  };

  const handleLike = (isLiked: boolean) => {
    likeMutation.mutate({ tweetId: tweetId, isLiked: isLiked });
  };
  const handleRepost = (isReposted: boolean) => {
    repostMutation.mutate({ tweetId: tweetId, isReposted: isReposted });
  };
  const handleBookmark = (isBookmarked: boolean) => {
    bookmarkMutation.mutate({ tweetId: tweetId, isBookmarked: isBookmarked });
  };

  const handleQuote = (content: string, mediaUris?: string[]) => {
    quotePostMutation.mutate({ content, mediaUris });
  };
  const handleDelete = () => {
    deletePostMutation.mutate();
  };

  const handleDeletePress = () => {
    Alert.alert('Delete post', 'Are you sure you want to delete this post?', [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: handleDelete,
      },
    ]);
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

  const handleReplyPress = () => {
    setCreatePostType('reply');
    setIsCreatePostModalVisible(true);
  };

  const handleQuotePress = () => {
    setCreatePostType('quote');
    setIsCreatePostModalVisible(true);
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

  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);

  const [createPostType, setCreatePostType] = useState<'tweet' | 'quote' | 'reply'>('tweet');

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const openSheet = () => {
    bottomSheetModalRef.current?.present();
  };

  if (props.tweetId) {
    return (
      <QueryWrapper query={tweetQuery}>
        {(fetchedTweet) => (
          <>
            <FullTweet
              tweet={fetchedTweet}
              onReplyPress={handleReplyPress}
              onLike={handleLike}
              onViewPostInteractions={handleViewPostInteractions}
              onBookmark={handleBookmark}
              onShare={handleShare}
              onDeletePress={handleDeletePress}
              openSheet={openSheet}
              onAvatarPress={handleAvatarPress}
            />

            <CreatePostModal
              visible={isCreatePostModalVisible}
              onClose={() => setIsCreatePostModalVisible(false)}
              type={createPostType}
              tweet={fetchedTweet}
              onPost={createPostType === 'reply' ? handleReply : handleQuote}
              onRepost={() => handleRepost(fetchedTweet.isReposted)}
            />

            <RepostOptionsModal
              isReposted={fetchedTweet.isReposted}
              onRepostPress={() => handleRepost(fetchedTweet.isReposted)}
              onQuotePress={handleQuotePress}
              onViewInteractionsPress={() => handleViewPostInteractions(fetchedTweet.tweetId, fetchedTweet.user.id)}
              bottomSheetModalRef={bottomSheetModalRef}
            />
          </>
        )}
      </QueryWrapper>
    );
  }

  if (props.tweet)
    return (
      <>
        <Tweet
          tweet={props.quotedTweet ? { ...props.tweet, parentTweet: props.quotedTweet } : props.tweet}
          onReplyPress={handleReplyPress}
          onLike={handleLike}
          onViewPostInteractions={handleViewPostInteractions}
          onBookmark={handleBookmark}
          onShare={handleShare}
          onDeletePress={handleDeletePress}
          openSheet={openSheet}
          isVisible={props.isVisible}
          onTweetPress={handleTweetPress}
          onAvatarPress={handleAvatarPress}
        />
        <CreatePostModal
          visible={isCreatePostModalVisible}
          onClose={() => setIsCreatePostModalVisible(false)}
          type={createPostType}
          tweet={props.tweet}
          onPost={createPostType === 'reply' ? handleReply : handleQuote}
          onRepost={() => handleRepost(props.tweet.isReposted)}
        />

        <RepostOptionsModal
          isReposted={props.tweet.isReposted}
          onRepostPress={() => handleRepost(props.tweet.isReposted)}
          onQuotePress={handleQuotePress}
          onViewInteractionsPress={() => handleViewPostInteractions(props.tweet.tweetId, props.tweet.user.id)}
          bottomSheetModalRef={bottomSheetModalRef}
        />
      </>
    );
};

export default TweetContainer;
