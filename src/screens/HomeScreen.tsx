import FollowersTab from '@/src/components/home/FollowersTab';
import ForYouTab from '@/src/components/home/ForYouTab';
import HomeTabView from '@/src/components/home/HomeTabView';
import XLogo from '@/src/components/icons/XLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
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

  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar
          children={<XLogo size={32} color={theme.colors.text.primary} />}
          tabView={<HomeTabView index={homeIndex} onIndexChange={(i) => setHomeIndex(i)} />}
        />
      </View>
      {homeIndex === 0 ? <ForYouTab /> : <FollowersTab />}
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
  });
