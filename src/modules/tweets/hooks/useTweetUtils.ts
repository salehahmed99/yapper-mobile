import useNavigation from '@/src/hooks/useNavigation';
import { useLocalSearchParams, useSegments } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';
import { useTweetActions } from './useTweetActions';

const useTweetUtils = () => {
  const { likeMutation, repostMutation, replyToPostMutation, quotePostMutation, bookmarkMutation, deletePostMutation } =
    useTweetActions();
  const { navigate } = useNavigation();
  const { t } = useTranslation();
  const segments = useSegments();

  const params = useLocalSearchParams();
  const currentProfileId = (segments as string[]).includes('(profile)') ? params.id : null;
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
    navigate({
      pathname: '/(protected)/(profile)/[id]',
      params: {
        id: username,
      },
    });
  };

  const handleHashtagPress = (hashtag: string) => {
    navigate({
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
      navigate({ pathname: '/(protected)/(profile)/[id]', params: { id: userId } });
    }
  };

  const handleViewPostInteractions = (tweetId: string, ownerId: string) => {
    navigate({
      pathname: '/(protected)/tweets/[tweetId]/activity',
      params: {
        tweetId: tweetId,
        ownerId: ownerId,
      },
    });
  };

  const handleShare = () => {};

  return {
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
  };
};

export default useTweetUtils;
