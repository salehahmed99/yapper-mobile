import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from './UiShellContext';

interface IAppBarProps {
  title?: string;
  children?: React.ReactNode;
  rightElement?: React.ReactNode;
}

const AppBar: React.FC<IAppBarProps> = (props) => {
  const { title, children, rightElement } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { toggleSideMenu, isSideMenuOpen } = useUiShell();
  const insets = useSafeAreaInsets();
  const appBarHeight = theme.ui.appBarHeight + insets.top;

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: appBarHeight }]}>
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
                source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }}
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
            {title ?? t('app.title')}
          </Text>
        )}
      </View>

      <View style={styles.sideContainer}>{rightElement}</View>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
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
  });

export default React.memo(AppBar);
