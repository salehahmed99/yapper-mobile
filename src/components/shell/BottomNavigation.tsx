import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { BlurView } from 'expo-blur';
import { usePathname, useRouter } from 'expo-router';
import { Bell, Home, Mail, Search } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from '../../context/UiShellContext';
import GrokLogo from '../icons/GrokLogo';

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const items = [
  { key: 'home', label: 'Home', path: '/(protected)', icon: Home },
  { key: 'search', label: 'Search', path: '/(protected)/search', icon: Search },
  { key: 'grok', label: 'Grok', path: '/(protected)/grok', icon: GrokLogo },
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
    router.replace(item.path as unknown as Parameters<typeof router.replace>[0]);
  };

  // Interpolate opacity based on scrollY: at y=0 -> 0.85, at y=300 -> 0.4
  const bgOpacity = scrollY.interpolate({
    inputRange: [0, 300],
    outputRange: [0.85, 0.4],
    extrapolate: 'clamp',
  });

  const insets = useSafeAreaInsets();
  const navHeight = theme.ui.navHeight + insets.bottom;
  const translateStyle = anim ? { transform: [{ translateX: anim }] } : undefined;

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
              <Icon
                color={isActive ? theme.colors.text.primary : theme.colors.text.secondary}
                size={theme.iconSizes.icon}
                style={styles.iconSpacing}
              />
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
  });
