import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import FullTweetContainer from '@/src/modules/tweets/containers/FullTweetContainer';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TweetDetailsScreen = () => {
  const { tweetId } = useLocalSearchParams<{ tweetId: string }>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <SafeAreaView style={styles.container}>
      <FullTweetContainer tweetId={tweetId} />
    </SafeAreaView>
  );
};

export default TweetDetailsScreen;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
  });
