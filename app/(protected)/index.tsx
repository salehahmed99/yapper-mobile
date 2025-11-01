import HomeTabView from '@/src/components/home/HomeTabView';
import XLogo from '@/src/components/icons/XLogo';
import QueryWrapper from '@/src/components/QueryWrapper';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import useMargins from '@/src/hooks/useMargins';
import TweetList from '@/src/modules/tweets/components/TweetList';
import { useTweets } from '@/src/modules/tweets/hooks/useTweets';
import { useTweetsFiltersStore } from '@/src/modules/tweets/store/useTweetsFiltersStore';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  // Use a local index for the Home top tabs (For You / Following).
  // We intentionally do NOT write this into the global `activeTab` state
  // so the bottom navigation remains correctly highlighted when switching
  // between these inner tabs.
  const [homeIndex, setHomeIndex] = React.useState(0);

  const tweetsFilters = useTweetsFiltersStore((state) => state.filters);

  const tweetsQuery = useTweets(tweetsFilters);

  const { marginTop, marginBottom } = useMargins();

  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar
          children={<XLogo size={32} color={theme.colors.text.primary} />}
          tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
        />
      </View>
      <View style={[styles.tweetContainer, { marginTop, marginBottom }]}>
        <QueryWrapper query={tweetsQuery}>{(tweets) => <TweetList data={tweets} />}</QueryWrapper>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background.primary,
    },
    appBarWrapper: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 1,
    },
    tweetContainer: {
      flex: 1,
      justifyContent: 'center',
    },
  });
