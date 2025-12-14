import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useNavigation } from '@/src/hooks/useNavigation';
import { useNotificationStore } from '@/src/store/useNotificationStore';
import { useUnreadMessagesStore } from '@/src/store/useUnreadMessagesStore';
import { BlurView } from 'expo-blur';
import { usePathname } from 'expo-router';
import { Bell, Home, Mail, Search } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, I18nManager, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from '../../context/UiShellContext';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const items = [
  { key: 'home', label: 'Home', path: '/(protected)', icon: Home },
  { key: 'search', label: 'Search', path: '/(protected)/explore', icon: Search },
  { key: 'notifications', label: 'Notifications', path: '/(protected)/notifications', icon: Bell },
  { key: 'messages', label: 'Messages', path: '/(protected)/messages', icon: Mail },
];

interface IBottomNavigationProps {
  anim?: Animated.Value;
}

const BottomNavigation: React.FC<IBottomNavigationProps> = (props) => {
  const { anim } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar' || I18nManager.isRTL;
  const { activeTab, setActiveTab, scrollY } = useUiShell();
  const { replace } = useNavigation();
  const pathname = usePathname();
  const unreadChatIds = useUnreadMessagesStore((state) => state.unreadChatIds);
  const unreadMessagesCount = unreadChatIds.size;

  const unreadNotificationsCount = useNotificationStore((state) => state.unreadCount);

  // Sync activeTab with current route
  useEffect(() => {
    const match = items.find((item) => item.path === pathname);
    if (match && activeTab !== match.key) {
      setActiveTab(match.key);
    }
  }, [pathname, activeTab, setActiveTab]);

  // Helper to normalize path by removing route group segments like (protected)
  const normalizePath = (path: string) => {
    // Remove segments that match (*) pattern (route groups)
    return path.replace(/\/\([^)]+\)/g, '').replace(/^$/, '/');
  };

  const onPress = (item: (typeof items)[number]) => {
    // Normalize both paths to compare without route group prefixes
    const normalizedItemPath = normalizePath(item.path);
    const normalizedPathname = normalizePath(pathname);

    const isCurrentRoute = normalizedPathname === normalizedItemPath;

    if (activeTab === item.key && isCurrentRoute) {
      // Already on this tab/route, do nothing
      return;
    }
    setActiveTab(item.key);
    // If navigating to the same path, replace so we don't stack; otherwise replace to navigate
    replace(item.path);
  };

  // Interpolate opacity based on scrollY: at y=0 -> 0.85, at y=300 -> 0.4
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0.85, 0.4],
    extrapolate: 'clamp',
  });

  const insets = useSafeAreaInsets();
  const navHeight = theme.ui.navHeight + insets.bottom;
  // In RTL, invert the translateX so navbar moves in the correct direction with drawer
  const translateStyle = anim ? { transform: [{ translateX: isRTL ? Animated.multiply(anim, -1) : anim }] } : undefined;

  return (
    <AnimatedBlurView
      intensity={10}
      style={[styles.container, styles.wrapper, translateStyle, { height: navHeight, paddingBottom: insets.bottom }]}
      accessibilityRole="tablist"
    >
      <Animated.View pointerEvents="none" style={[styles.bgLayer, { height: navHeight, opacity: bgOpacity }]} />
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
              testID={`bottom_nav_${item.key}`}
              accessibilityState={{ selected: isActive }}
            >
              <View>
                <Icon
                  color={isActive ? theme.colors.text.primary : theme.colors.text.secondary}
                  size={theme.iconSizes.icon}
                  style={styles.iconSpacing}
                />
                {item.key === 'notifications' && unreadNotificationsCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </Text>
                  </View>
                )}
                {item.key === 'messages' && unreadMessagesCount > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </Animated.View>
    </AnimatedBlurView>
  );
};

export default React.memo(BottomNavigation);

const createStyles = (theme: Theme) =>
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
    itemActive: {},
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
    bgLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.colors.background.primary,
      zIndex: 0,
    },
    iconSpacing: {
      marginBottom: theme.spacing.xs / 2,
    },
    badge: {
      position: 'absolute',
      top: -6,
      right: -10,
      backgroundColor: theme.colors.accent.bookmark,
      borderRadius: 10,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontFamily: theme.typography.fonts.bold,
      textAlign: 'center',
    },
  });
