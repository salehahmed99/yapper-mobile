import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatDateDDMMYYYY, formatShortTime } from '@/src/utils/dateUtils';
import { formatCount } from '@/src/utils/formatCount';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';
import ActionsRow from './ActionsRow';
import ParentTweet from './ParentTweet';
import RepostIndicator from './RepostIndicator';

interface IFullTweetProps {
  tweet: ITweet;
  parentTweet?: ITweet | null;
  onReplyPress: () => void;
  onRepostPress: (isReposted: boolean) => void;
  onLikePress: (isLiked: boolean) => void;
  onViewsPress: () => void;
  onBookmarkPress: () => void;
  onSharePress: () => void;
}

const FullTweet: React.FC<IFullTweetProps> = (props) => {
  const { tweet, parentTweet, onReplyPress, onRepostPress, onLikePress, onViewsPress, onSharePress } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const router = useRouter();

  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <View style={styles.container} accessibilityLabel="full_tweet_container_main">
      {tweet.type === 'repost' && (
        <RepostIndicator repostById={tweet.repostedBy?.id} repostedByName={tweet.repostedBy?.name} />
      )}

      {/* User Info Header */}
      <View style={styles.header}>
        <View style={styles.userInfoContainer}>
          <Pressable
            onPress={() => router.push({ pathname: '/(protected)/(profile)/[id]', params: { id: tweet.user.id } })}
          >
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
        {/* <View style={styles.optionsRow}>
          <GrokLogo size={16} color={theme.colors.text.secondary} />
          <View ref={moreButtonRef} collapsable={false}>
            <TouchableOpacity onPress={handleMorePress} hitSlop={8}>
              <MoreHorizontal size={16} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View> */}
      </View>

      {/* Tweet Content */}
      <View style={styles.contentSection}>
        <Text style={styles.tweetText}>{tweet.content}</Text>
      </View>

      {/* Parent Tweet (Quote) */}
      {parentTweet && <ParentTweet tweet={parentTweet} />}

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
          onRepostPress={onRepostPress}
          onLikePress={onLikePress}
          onViewsPress={onViewsPress}
          onBookmarkPress={() => setIsBookmarked(!isBookmarked)}
          isBookmarked={isBookmarked}
          onSharePress={onSharePress}
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
