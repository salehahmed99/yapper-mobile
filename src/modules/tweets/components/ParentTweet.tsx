import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ITweet } from '../types';
import { parseTweetBody } from '../utils/tweetParser';
import TweetContent from './TweetContent';
import TweetMedia from './TweetMedia';
import UserInfoRow from './UserInfoRow';

interface IParentTweetProps {
  tweet: ITweet;
  isVisible?: boolean;
}
const ParentTweet: React.FC<IParentTweetProps> = (props) => {
  const { tweet } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const segments = useMemo(() => parseTweetBody(tweet.content, tweet.mentions), [tweet.content, tweet.mentions]);
  return (
    <Pressable
      style={styles.container}
      accessibilityLabel="tweet_container_parent"
      onPress={() => {
        router.push({
          pathname: '/(protected)/tweets/[tweetId]',
          params: {
            tweetId: tweet.tweetId,
            tweetUserId: tweet.user.id,
          },
        });
      }}
    >
      <View style={styles.userInfo}>
        <Image
          source={
            tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : require('@/assets/images/avatar-placeholder.png')
          }
          style={styles.avatar}
          accessibilityLabel="tweet_image_parent_avatar"
        />
        <UserInfoRow tweet={tweet} />
      </View>
      <TweetContent segments={segments} />
      {/* Tweet Media */}
      {(tweet.images.length > 0 || tweet.videos.length > 0) && (
        <TweetMedia images={tweet.images} videos={tweet.videos} tweetId={tweet.tweetId} />
      )}
    </Pressable>
  );
};

export default ParentTweet;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      borderWidth: theme.borderWidth.thin,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.sm,
      gap: theme.spacing.sm,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    avatar: {
      width: theme.iconSizes.md,
      height: theme.iconSizes.md,
      borderRadius: theme.borderRadius.full,
    },
    tweetContent: {},
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
      textAlign: 'left',
    },
  });
