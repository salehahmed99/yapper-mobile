import FollowersTab from '@/src/components/home/FollowersTab';
import ForYouTab from '@/src/components/home/ForYouTab';
import HomeTabView from '@/src/components/home/HomeTabView';
import XLogo from '@/src/components/icons/XLogo';
import AppBar from '@/src/components/shell/AppBar';
import type { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useUiShell } from '@/src/context/UiShellContext';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function HomeScreen() {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { activeTab: activeTabKey, setActiveTab } = useUiShell();
  const tabKeys = ['foryou', 'following'];
  const activeTab = Math.max(0, tabKeys.indexOf(activeTabKey));

  return (
    <View style={styles.container}>
      <View style={styles.appBarWrapper}>
        <AppBar
          children={<XLogo size={32} color={theme.colors.text.primary} />}
          tabView={<HomeTabView index={activeTab} onIndexChange={(i) => setActiveTab(tabKeys[i])} />}
        />
      </View>
      {activeTab === 0 ? <ForYouTab /> : <FollowersTab />}
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
