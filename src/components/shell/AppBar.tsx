import { useTheme } from '@/src/context/ThemeContext';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
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
  const { toggleSideMenu, isSideMenuOpen } = useUiShell();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top, height: 56 + insets.top }]}>
      <View style={styles.sideContainer}>
        {!isSideMenuOpen ? (
          <TouchableOpacity onPress={toggleSideMenu} accessibilityLabel="Open menu" style={styles.avatarButton}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
          </TouchableOpacity>
        ) : (
          <View style={styles.avatarButton} />
        )}
      </View>

      <View style={styles.center}>
        {children ? (
          children
        ) : (
          <Text numberOfLines={1} style={styles.title} accessibilityRole="header">
            {title ?? 'Yapper'}
          </Text>
        )}
      </View>

      <View style={styles.sideContainer}>{rightElement}</View>
    </View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      height: 56,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: theme.spacing.md,
      backgroundColor: theme.colors.background.secondary,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
    },
    menuButton: {
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    menuText: {
      fontSize: 20,
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
    sideContainer: { width: 40, alignItems: 'center', justifyContent: 'center' },
    avatarButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  });

export default React.memo(AppBar);
