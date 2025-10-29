import { useTheme } from '@/src/context/ThemeContext';
import { usePathname, useRouter } from 'expo-router';
import { Bell, Bot, Home, Mail, Search } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from './UiShellContext';

const items = [
  { key: 'home', label: 'Home', path: '/(protected)', icon: Home },
  { key: 'search', label: 'Search', path: '/search', icon: Search },
  { key: 'grok', label: 'Grok', path: '/grok', icon: Bot },
  { key: 'notifications', label: 'Notifications', path: '/notifications', icon: Bell },
  { key: 'messages', label: 'Messages', path: '/messages', icon: Mail },
];

interface IBottomNavigationProps {
  anim?: Animated.Value;
}

const BottomNavigation: React.FC<IBottomNavigationProps> = (props) => {
  const { anim } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const { activeTab, setActiveTab, scrollY } = useUiShell();
  const router = useRouter();
  const pathname = usePathname();

  // Sync activeTab with current route
  useEffect(() => {
    const match = items.find((item) => item.path === pathname);
    if (match && activeTab !== match.key) {
      setActiveTab(match.key);
    }
  }, [pathname, activeTab, setActiveTab]);

  const onPress = (item: (typeof items)[number]) => {
    if (activeTab === item.key && pathname === item.path) {
      // Already on this tab/route, do nothing
      return;
    }
    setActiveTab(item.key);
    // If navigating to the same path, replace so we don't stack; otherwise replace to navigate
    router.replace(item.path as any);
  };

  // Interpolate opacity based on scrollY: at y=0 -> 0.95, at y=150 -> 0.5
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0.95, 0.5],
    extrapolate: 'clamp',
  });

  const containerBg = theme.colors.background.primary;
  const insets = useSafeAreaInsets();
  const navHeight = theme.ui.navHeight + insets.bottom;
  const translateStyle = anim ? { transform: [{ translateX: anim }] } : undefined;

  return (
    <Animated.View
      style={[styles.container, styles.wrapper, translateStyle, { height: navHeight, paddingBottom: insets.bottom }]}
      accessibilityRole="tablist"
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: navHeight,
          backgroundColor: containerBg,
          opacity: bgOpacity,
          zIndex: 0,
        }}
      />
      <Animated.View style={styles.row}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.key;
          const label = t(`nav.${item.key}`);
          return (
            <TouchableOpacity
              key={item.key}
              onPress={() => onPress(item)}
              style={[styles.item, isActive && styles.itemActive]}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected: isActive }}
            >
              <Icon
                color={isActive ? theme.colors.text.primary : theme.colors.text.secondary}
                size={theme.iconSizes.icon}
                style={{ marginBottom: theme.spacing.xs / 2 }}
              />
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </Animated.View>
  );
};

export default React.memo(BottomNavigation);

const createStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      height: theme.ui.navHeight,
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    // ensure nav sits above content
    wrapper: {
      zIndex: 50,
      elevation: 50,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    itemActive: {
      backgroundColor: 'transparent',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flex: 1,
    },
    label: {
      color: theme.colors.text.secondary,
    },
    labelActive: {
      color: theme.colors.text.primary,
      fontFamily: theme.typography.fonts.semiBold,
    },
  });
