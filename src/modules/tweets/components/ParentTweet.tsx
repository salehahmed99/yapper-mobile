import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';
import UserInfoRow from './UserInfoRow';

interface IParentTweetProps {
  tweet: ITweet;
}
const ParentTweet: React.FC<IParentTweetProps> = (props) => {
  const { tweet } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  return (
    <View style={styles.container} accessibilityLabel="tweet_container_parent">
      <View style={styles.userInfo}>
        <Image
          source={
            tweet.user.avatar_url ? { uri: tweet.user.avatar_url } : require('@/assets/images/avatar-placeholder.png')
          }
          style={styles.avatar}
          accessibilityLabel="tweet_image_parent_avatar"
        />
        <UserInfoRow tweet={tweet} />
      </View>
      <View style={styles.tweetContent}>
        <Text style={styles.tweetText}>{tweet.content}</Text>
      </View>
    </View>
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
    },
  });
