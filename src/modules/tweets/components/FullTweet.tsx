import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatDateDDMMYYYY, formatShortTime } from '@/src/utils/dateUtils';
import { formatCount } from '@/src/utils/formatCount';
import { Image } from 'expo-image';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';
import ActionsRow from './ActionsRow';
import RepostIndicator from './RepostIndicator';
import TweetMedia from './TweetMedia';

interface IFullTweetProps {
  tweet: ITweet;
  onReplyPress: () => void;
  onLike: (isLiked: boolean) => void;
  onViewPostInteractions: (tweetId: string, ownerId: string) => void;
  onBookmark: () => void;
  onShare: () => void;
  openSheet: () => void;
  onAvatarPress: (userId: string) => void;
}

const FullTweet: React.FC<IFullTweetProps> = (props) => {
  const {
    tweet,
    onReplyPress,
    onLike,
    // onBookmark,
    onShare,
    openSheet,
    onAvatarPress,
  } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <View style={styles.container} accessibilityLabel="full_tweet_container_main">
      {tweet.type === 'repost' && (
        <RepostIndicator repostById={tweet.repostedBy?.id} repostedByName={tweet.repostedBy?.name} />
      )}

      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Pressable onPress={() => onAvatarPress(tweet.user.id)}>
            <Image
              source={
                tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : require('@/assets/images/avatar-placeholder.png')
              }
              style={styles.avatar}
              accessibilityLabel="full_tweet_image_avatar"
            />
          </Pressable>
          <View style={styles.userDetails}>
            <Text style={styles.name}>{tweet.user.name}</Text>
            <Text style={styles.username}>@{tweet.user.username}</Text>
          </View>
        </View>
      </View>

      {/* Tweet Content */}
      <View style={styles.contentSection}>
        <Text style={styles.tweetText}>{tweet.content}</Text>
      </View>

      {/* Tweet Media */}
      {(tweet.images.length > 0 || tweet.videos.length > 0) && (
        <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} isVisible={true} />
      )}

      {/* Parent Tweet (Quote) */}
      {/* {parentTweet && <ParentTweet tweet={parentTweet} />} */}

      {/* iOS-style Timestamp with Views */}
      <View style={styles.timestampViewsSection}>
        <Text style={styles.timestampText}>{formatShortTime(tweet.createdAt)}</Text>
        <View style={styles.dot}></View>
        <Text style={styles.timestampText}>{formatDateDDMMYYYY(tweet.createdAt)}</Text>
        <View style={styles.dot}></View>
        <Text style={styles.viewsCount}>
          {formatCount(tweet.viewsCount)}
          <Text style={styles.timestampText}> Views</Text>{' '}
        </Text>
      </View>

      {/* Actions Row */}
      <View style={styles.actionsSection}>
        <ActionsRow
          tweet={tweet}
          size="large"
          onReplyPress={onReplyPress}
          onRepostPress={openSheet}
          onLikePress={onLike}
          onBookmarkPress={() => setIsBookmarked(!isBookmarked)}
          isBookmarked={isBookmarked}
          onSharePress={onShare}
        />
      </View>
    </View>
  );
};

export default FullTweet;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      padding: theme.spacing.md,
      paddingBottom: theme.spacing.xxxl,
      backgroundColor: theme.colors.background.primary,
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
    contentSection: {},
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      fontSize: theme.typography.sizes.md,
      lineHeight: theme.typography.sizes.md * 1.3,
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
