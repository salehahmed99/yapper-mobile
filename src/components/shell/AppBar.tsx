import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BlurView } from 'expo-blur';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from '../../context/UiShellContext';

interface IAppBarProps {
  title?: string;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
  tabView?: React.ReactNode;
}

const AppBar: React.FC<IAppBarProps> = (props) => {
  const { title, children, rightElement, tabView } = props;
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { toggleSideMenu, isSideMenuOpen, appBarVisible } = useUiShell();
  const insets = useSafeAreaInsets();
  const appBarHeight = theme.ui.appBarHeight + insets.top + (tabView ? theme.ui.tabViewHeight : 0);

  // When appBar is hidden we still keep a minimal visible blur area equal to the
  // top safe-area inset so the status bar region stays blurred. (If you prefer to
  // keep bottom inset instead, switch `insets.top` to `insets.bottom` here.)
  const visibleHeight = appBarVisible ? appBarHeight : insets.top;

  return (
    <BlurView intensity={30} style={[styles.container, { paddingTop: insets.top, height: visibleHeight }]}>
      {appBarVisible ? (
        <>
          <View style={styles.headerContainer}>
            <View style={styles.sideContainer}>
              {!isSideMenuOpen ? (
                <Pressable
                  onPress={toggleSideMenu}
                  accessibilityLabel={t('accessibility.openMenu')}
                  accessibilityRole="button"
                  style={styles.avatarButton}
                >
                  <View style={styles.avatarBackground}>
                    <Image
                      source={{ uri: user?.avatarUrl || DEFAULT_AVATAR_URL }}
                      style={styles.avatar}
                      resizeMode="cover"
                    />
                  </View>
                </Pressable>
              ) : (
                <View style={styles.avatarButton} />
              )}
            </View>

            <View style={styles.center}>
              {children ? (
                children
              ) : (
                <Text numberOfLines={1} style={styles.title} accessibilityRole="header">
                  {title ?? t('home.title')}
                </Text>
              )}
            </View>

            <View style={styles.sideContainer}>{rightElement}</View>
          </View>
          {tabView && <View style={styles.tabContainer}>{tabView}</View>}
        </>
      ) : (
        <View style={styles.hiddenSpacer} />
      )}
    </BlurView>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'column',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.primary + '6F',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: theme.ui.appBarHeight,
    },
    tabContainer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: theme.ui.tabViewHeight,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatar: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      borderRadius: theme.ui.avatar / 2,
    },
    avatarBackground: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      borderRadius: theme.ui.avatar / 2,
      overflow: 'hidden',
      backgroundColor: theme?.colors?.background?.tertiary,
    },
    menuButton: {
      width: theme.ui.sideContainerWidth,
      height: theme.ui.sideContainerWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.text.primary,
    },
    title: {
      textAlign: 'center',
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    sideContainer: { width: theme.ui.sideContainerWidth, alignItems: 'center', justifyContent: 'center' },
    avatarButton: {
      width: theme.ui.sideContainerWidth,
      height: theme.ui.sideContainerWidth,
      alignItems: 'center',
      justifyContent: 'center',
    },
    hiddenSpacer: {
      height: 1,
      width: '100%',
    },
  });

export default React.memo(AppBar);
