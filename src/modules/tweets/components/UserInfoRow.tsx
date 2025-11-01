import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { formatTweetDate } from '@/src/utils/formatTweetDate';
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
    <View style={styles.userInfoRow}>
      <Text style={styles.name}>{tweet.user.name}</Text>
      <Text style={styles.username}>@{tweet.user.username}</Text>
      <View style={styles.dot} />
      <Text style={styles.username}>{tweet.created_at && formatTweetDate(tweet.created_at)}</Text>
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
    },
    name: {
      fontFamily: theme.typography.fonts.semiBold,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.primary,
    },
    username: {
      fontFamily: theme.typography.fonts.light,
      fontSize: theme.typography.sizes.sm,
      color: theme.colors.text.secondary,
    },
    dot: {
      width: 2,
      height: 2,
      backgroundColor: theme.colors.text.secondary,
    },
  });
