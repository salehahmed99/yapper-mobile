import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatDateDDMMYYYY, formatShortTime } from '@/src/utils/dateUtils';
import { formatCount } from '@/src/utils/formatCount';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';
import { parseTweetBody } from '../utils/tweetParser';
import ActionsRow from './ActionsRow';
import CreatePostModal from './CreatePostModal';
import ParentTweet from './ParentTweet';
import RepostOptionsModal from './RepostOptionsModal';
import TweetContent from './TweetContent';
import TweetMedia from './TweetMedia';

interface IFullTweetProps {
  tweet: ITweet;
  onAvatarPress: (userId: string) => void;
  onReply: (tweetId: string, content: string) => void;
  onQuote: (tweetId: string, content: string) => void;
  onRepost: (tweetId: string, isReposted: boolean) => void;
  onLike: (tweetId: string, isLiked: boolean) => void;
  onBookmark: (tweetId: string, isBookmarked: boolean) => void;
  onViewPostInteractions: (tweetId: string, ownerId: string) => void;
  onShare: () => void;
  onMentionPress: (username: string) => void;
  onHashtagPress: (hashtag: string) => void;
}

const FullTweet: React.FC<IFullTweetProps> = (props) => {
  const {
    tweet,
    onAvatarPress,
    onReply,
    onQuote,
    onRepost,
    onLike,
    onBookmark,
    onViewPostInteractions,
    onShare,
    onMentionPress,
    onHashtagPress,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { t } = useTranslation();

  const handleReplyPress = () => {
    setCreatePostType('reply');
    setIsCreatePostModalVisible(true);
  };

  const handleQuotePress = () => {
    setCreatePostType('quote');
    setIsCreatePostModalVisible(true);
  };

  const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);

  const [createPostType, setCreatePostType] = useState<'tweet' | 'quote' | 'reply'>('tweet');

  const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

  const handleRepostPress = () => {
    bottomSheetModalRef.current?.present();
  };

  const segments = useMemo(() => parseTweetBody(tweet.content, tweet.mentions), [tweet.content, tweet.mentions]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Pressable
            onPress={() => onAvatarPress(tweet.user.id)}
            accessibilityLabel="full_tweet_avatar"
            testID="full_tweet_avatar"
          >
            <Image
              source={tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : DEFAULT_AVATAR_URL}
              style={styles.avatar}
              accessibilityLabel="full_tweet_image_avatar"
            />
          </Pressable>
          <View style={styles.userDetails}>
            <Text style={styles.name} accessibilityLabel="full_tweet_user_name" testID="full_tweet_user_name">
              {tweet.user.name}
            </Text>
            <Text
              style={styles.username}
              accessibilityLabel="full_tweet_user_username"
              testID="full_tweet_user_username"
            >
              @{tweet.user.username}
            </Text>
          </View>
        </View>
      </View>

      <TweetContent segments={segments} onMentionPress={onMentionPress} onHashtagPress={onHashtagPress} />

      {(tweet.images.length > 0 || tweet.videos.length > 0) && (
        <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} />
      )}

      {tweet.type === 'quote' && tweet.parentTweet && (
        <View style={{ marginTop: theme.spacing.xs }}>
          <ParentTweet tweet={tweet.parentTweet} />
        </View>
      )}

      <View
        style={styles.timestampViewsSection}
        accessibilityLabel="full_tweet_timestamp_views"
        testID="full_tweet_timestamp_views"
      >
        <Text style={styles.timestampText} accessibilityLabel="full_tweet_time" testID="full_tweet_time">
          {formatShortTime(tweet.createdAt)}
        </Text>
        <View style={styles.dot}></View>
        <Text style={styles.timestampText} accessibilityLabel="full_tweet_date" testID="full_tweet_date">
          {formatDateDDMMYYYY(tweet.createdAt)}
        </Text>
        <View style={styles.dot}></View>
        <Text style={styles.viewsCount} accessibilityLabel="full_tweet_views_count" testID="full_tweet_views_count">
          {formatCount(tweet.viewsCount)}
          <Text style={styles.timestampText}> {t('tweets.full_tweet.views')}</Text>{' '}
        </Text>
      </View>

      <View style={styles.actionsSection}>
        <ActionsRow
          tweet={tweet}
          size="large"
          onReplyPress={handleReplyPress}
          onRepostPress={handleRepostPress}
          onLikePress={() => onLike(tweet.tweetId, tweet.isLiked)}
          onBookmarkPress={() => onBookmark(tweet.tweetId, tweet.isBookmarked)}
          onSharePress={onShare}
        />
      </View>

      <CreatePostModal
        visible={isCreatePostModalVisible}
        onClose={() => setIsCreatePostModalVisible(false)}
        type={createPostType}
        tweet={tweet}
        onPostReply={onReply}
        onPostQuote={onQuote}
      />

      <RepostOptionsModal
        isReposted={tweet.isReposted}
        onRepostPress={() => onRepost(tweet.tweetId, tweet.isReposted)}
        onQuotePress={handleQuotePress}
        onViewInteractionsPress={() => onViewPostInteractions(tweet.tweetId, tweet.user.id)}
        bottomSheetModalRef={bottomSheetModalRef}
      />
    </View>
  );
};

export default FullTweet;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerBlur: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.lg,
      backgroundColor: theme.colors.background.primary + 'DF',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 10,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: theme.ui.appBarHeight,
      width: '100%',
    },
    headerButton: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerCenter: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontSize: 18,
      fontFamily: theme.typography.fonts.extraBold,
    },
    headerRightActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.md,
    },
    container: {
      marginTop: theme.spacing.md,
      padding: theme.spacing.md,
      backgroundColor: theme.colors.background.primary,
      paddingBottom: theme.spacing.xxl,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: theme.spacing.md,
    },
    userInfoContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: theme.avatarSizes.md,
      height: theme.avatarSizes.md,
      borderRadius: theme.borderRadius.full,
      backgroundColor: theme.colors.background.secondary,
    },
    userDetails: {
      gap: 2,
      alignItems: 'flex-start',
    },
    name: {
      fontFamily: theme.typography.fonts.bold,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.primary,
    },
    username: {
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },

    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * 1.3,
      textAlign: 'left',
    },
    timestampViewsSection: {
      paddingTop: theme.spacing.xl,
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
    },
    dot: {
      width: 2,
      height: 2,
      borderRadius: 1,
      backgroundColor: theme.colors.text.secondary,
    },
    timestampText: {
      fontFamily: theme.typography.fonts.regular,
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.xs,
    },
    viewsCount: {
      fontFamily: theme.typography.fonts.bold,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xs,
    },
    actionsSection: {
      paddingTop: theme.spacing.lg,
    },
  });
