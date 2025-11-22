import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatTweetDate } from '@/src/modules/tweets/utils/formatTweetDate';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ITweet } from '../types';

interface IUserInfoRowProps {
  tweet: ITweet;
}

const UserInfoRow: React.FC<IUserInfoRowProps> = (props) => {
  const { tweet } = props;
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.userInfoRow} accessibilityLabel="tweet_user_info" testID="tweet_user_info">
      <Text style={styles.name} numberOfLines={1} accessibilityLabel="tweet_user_name">
        {tweet.user.name}
      </Text>
      <Text style={styles.username} numberOfLines={1} accessibilityLabel="tweet_user_username">
        @{tweet.user.username}
      </Text>
      <View style={styles.dot} />
      <Text style={styles.timestamp} accessibilityLabel="tweet_timestamp">
        {tweet.createdAt && formatTweetDate(tweet.createdAt)}
      </Text>
    </View>
  );
};

export default UserInfoRow;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    userInfoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.xs,
      flex: 1,
    },
    name: {
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.primary,
      flexShrink: 1,
    },
    username: {
      fontFamily: theme.typography.fonts.light,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      flexShrink: 2,
    },
    dot: {
      width: 2,
      height: 2,
      backgroundColor: theme.colors.text.secondary,
      flexShrink: 0,
    },
    timestamp: {
      fontFamily: theme.typography.fonts.light,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
      flexShrink: 0,
    },
  });
