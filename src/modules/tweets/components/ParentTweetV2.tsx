import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';
import UserInfoRow from './UserInfoRow';

interface IParentTweetV2Props {
  tweet: ITweet;
}
const ParentTweetV2: React.FC<IParentTweetV2Props> = (props) => {
  const { tweet } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container} accessibilityLabel="tweet_container_parent">
      <View style={styles.avatarColumn}>
        <Image
          source={
            tweet.user.avatarUrl ? { uri: tweet.user.avatarUrl } : require('@/assets/images/avatar-placeholder.png')
          }
          style={styles.avatar}
          accessibilityLabel="tweet_image_parent_avatar"
        />
        <View style={styles.verticalLine} />
      </View>
      <View style={styles.tweetBody}>
        <View style={styles.userInfo}>
          <UserInfoRow tweet={tweet} />
        </View>
        <View style={styles.tweetContent}>
          <Text style={styles.tweetText}>{tweet.content}</Text>
        </View>
        <View style={styles.replyingToContainer}>
          <Text style={styles.replyingToText}>
            Replying to <Text style={styles.username}>@{tweet.user.username}</Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default ParentTweetV2;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.lg,
      marginTop: theme.spacing.sm,
      //   borderWidth: 1,
      //   borderColor: 'red',
      gap: theme.spacing.md,
      flexDirection: 'row',
    },
    avatarColumn: {
      alignItems: 'center',
    },
    avatar: {
      width: theme.avatarSizes.sm,
      height: theme.avatarSizes.sm,
      borderRadius: theme.avatarSizes.sm / 2,
    },
    verticalLine: {
      width: 2,
      flex: 1,
      backgroundColor: theme.colors.border,
      marginTop: theme.spacing.xxs,
    },
    tweetBody: {
      flex: 1,
      //   borderWidth: 1,
      //   borderColor: 'red',
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    tweetContent: {},
    tweetText: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.regular,
    },
    replyingToContainer: {
      marginTop: theme.spacing.xxll,
    },
    replyingToText: {
      fontFamily: theme.typography.fonts.light,
      fontSize: theme.typography.sizes.xs,
      color: theme.colors.text.secondary,
    },
    username: {
      color: theme.colors.accent.bookmark,
      fontFamily: theme.typography.fonts.light,
    },
  });
