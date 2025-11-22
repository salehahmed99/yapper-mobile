import { Theme } from '@/src/constants/theme';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import { useTheme } from '@/src/context/ThemeContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import TweetContainer from '@/src/modules/tweets/containers/TweetContainer';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TweetDetailsScreen = () => {
  const { tweetId } = useLocalSearchParams<{ tweetId: string }>();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <MediaViewerProvider>
      <SafeAreaView style={styles.container}>
        <TweetContainer tweetId={tweetId} />
        <MediaViewerModal />
      </SafeAreaView>
    </MediaViewerProvider>
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
