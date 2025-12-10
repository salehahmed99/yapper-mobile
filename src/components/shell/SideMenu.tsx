import ThemeSettingsSheet from '@/src/components/shell/ThemeSettingsSheet';
import { DEFAULT_AVATAR_URL } from '@/src/constants/defaults';
import { Theme } from '@/src/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useAuthStore } from '@/src/store/useAuthStore';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { usePathname, useRouter } from 'expo-router';
import { Bell, Bookmark, HelpCircle, MessageCircle, MoonStar, Search, Settings, User } from 'lucide-react-native';
import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Animated,
  GestureResponderHandlers,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from '../../context/UiShellContext';

interface ISideMenuProps {
  anim: Animated.Value;
  panHandlers?: GestureResponderHandlers;
}

const SideMenu: React.FC<ISideMenuProps> = (props) => {
  const { anim } = props;
  const user = useAuthStore((state) => state.user);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const { t } = useTranslation();
  const router = useRouter();
  const { isSideMenuOpen, closeSideMenu } = useUiShell();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [isThemeSheetVisible, setIsThemeSheetVisible] = React.useState(false);

  function navigate(path: string) {
    // If already on target path, just close menu
    if (pathname === path) {
      closeSideMenu();
      return;
    }
    closeSideMenu();
    router.push(path as unknown as Parameters<typeof router.push>[0]);
  }

  React.useEffect(() => {
    if (isSideMenuOpen) {
      Animated.timing(anim, {
        toValue: theme.ui.drawerWidth,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [isSideMenuOpen, anim, theme.ui.drawerWidth]);

  // Drawer opacity follows anim so the drawer is visible while dragging
  const drawerOpacity = anim.interpolate({
    inputRange: [0, theme.ui.drawerWidth],
    outputRange: [0.1, 1],
    extrapolate: 'clamp',
  });

  const overlayBg = `${theme.colors.background.primary}6F`;

  return (
    <Animated.View style={styles.root} pointerEvents="box-none">
      <Animated.View
        {...(props.panHandlers ?? {})}
        style={[styles.drawer, { left: Animated.subtract(anim, theme.ui.drawerWidth), opacity: drawerOpacity }]}
        accessibilityElementsHidden={!isSideMenuOpen}
        importantForAccessibility={isSideMenuOpen ? 'yes' : 'no-hide-descendants'}
      >
        <View style={[styles.innerFlex, { paddingTop: insets.top + theme.spacing.sm, paddingStart: theme.spacing.sm }]}>
          {/* Profile + other accounts in one row */}
          <View style={styles.profileAndAccountsRow}>
            <TouchableOpacity
              onPress={() => navigate('/(profile)/Profile/')}
              accessibilityLabel="sidemenu_profile_button"
              testID="sidemenu_profile_button"
              accessibilityRole="button"
            >
              <View style={styles.profileCol}>
                <Image source={{ uri: user?.avatarUrl || DEFAULT_AVATAR_URL }} style={styles.avatar} />
                <Text style={styles.name}>{user?.name || 'User'}</Text>
                <Text style={styles.username}>@{user?.username || 'username'}</Text>
              </View>
            </TouchableOpacity>

            {/* <View style={styles.accountsRow}>
              <View style={styles.smallAvatars}>
                <Image source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }} style={styles.smallAvatar} />
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/3.jpg' }} style={styles.smallAvatar} />
              </View>
              <TouchableOpacity style={styles.optionsButton} onPress={() => {}}>
                <CircleEllipsis color={theme.colors.text.primary} size={32} />
              </TouchableOpacity>
            </View> */}
          </View>

          {/* followers/following */}
          <View style={styles.followRow}>
            <TouchableOpacity
              onPress={() => {
                closeSideMenu();
                // router.push("/(profile)/Lists?tab=following");
              }}
              accessibilityLabel="sidemenu_following_button"
              testID="sidemenu_following_button"
            >
              <Text style={styles.followCount}>
                <Text style={styles.bold}>{user?.following || 0}</Text> Following
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                closeSideMenu();
                // router.push("/(profile)/Lists?tab=followers");
              }}
              accessibilityLabel="sidemenu_followers_button"
              testID="sidemenu_followers_button"
            >
              <Text style={styles.followCount}>
                <Text style={styles.bold}>{user?.followers || 0}</Text> Followers
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={{ paddingBottom: theme.spacing.xxl * 3 + insets.bottom }}
            showsVerticalScrollIndicator={false}
          >
            {/* Menu tiles */}
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/search')}
              accessibilityLabel="sidemenu_search_button"
              testID="sidemenu_search_button"
            >
              <Search color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.search')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/notifications')}
              accessibilityLabel="sidemenu_notifications_button"
              testID="sidemenu_notifications_button"
            >
              <Bell color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.notifications')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/messages')}
              accessibilityLabel="sidemenu_messages_button"
              testID="sidemenu_messages_button"
            >
              <MessageCircle color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.messages')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(profile)/Profile/')}
              accessibilityLabel="sidemenu_profile_menu_button"
              testID="sidemenu_profile_menu_button"
            >
              <User color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.profile')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/bookmarks')}
              accessibilityLabel="sidemenu_bookmarks_button"
              testID="sidemenu_bookmarks_button"
            >
              <Bookmark color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.bookmarks')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/bookmarks')}
              accessibilityLabel="sidemenu_bookmarks_button"
              testID="sidemenu_bookmarks_button"
            >
              <Bookmark color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.bookmarks')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/(settings)/settingsScreen')}
              accessibilityLabel="sidemenu_settings_button"
              testID="sidemenu_settings_button"
            >
              <Settings color={theme.colors.text.primary} size={theme.iconSizes.iconLarge} />
              <Text style={styles.menuTileText}>{t('menu.settings')}</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Utility links */}
            <TouchableOpacity
              style={styles.tile}
              onPress={() => navigate('/(protected)/help')}
              accessibilityLabel="sidemenu_help_button"
              testID="sidemenu_help_button"
            >
              <HelpCircle color={theme.colors.text.primary} size={theme.iconSizes.icon} />
              <Text style={styles.tileText}>{t('menu.help')}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Bottom overlay */}
        <BlurView
          pointerEvents="auto"
          intensity={16}
          style={[styles.bottomOverlay, { height: theme.ui.navHeight + insets.bottom, backgroundColor: overlayBg }]}
        >
          <View style={styles.toggleWrapper}>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setIsThemeSheetVisible(true);
              }}
              style={styles.toggleButton}
              accessibilityLabel="sidemenu_toggle_theme_button"
              testID="sidemenu_toggle_theme_button"
            >
              <MoonStar color={theme.colors.text.primary} size={theme.iconSizes.icon} />
            </TouchableOpacity>
          </View>
        </BlurView>
      </Animated.View>

      <ThemeSettingsSheet visible={isThemeSheetVisible} onClose={() => setIsThemeSheetVisible(false)} />
    </Animated.View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    root: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: theme.colors.overlay,
    },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: theme.ui.drawerWidth,
      left: 0,
      backgroundColor: theme.colors.background.primary,
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      shadowColor: theme.colors.text.primary,
      shadowOffset: { width: 2, height: 0 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 8,
      zIndex: 100,
    },
    header: {
      fontSize: theme.typography.sizes.lg,
      color: theme.colors.text.primary,
      marginBottom: theme.spacing.md,
      fontFamily: theme.typography.fonts.semiBold,
    },
    item: {
      paddingVertical: theme.spacing.sm,
    },
    itemText: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
    },
    // Profile area
    profileCol: {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    avatar: {
      width: theme.ui.avatarLarge,
      height: theme.ui.avatarLarge,
      borderRadius: theme.ui.avatarLarge / 2,
      marginRight: theme.spacing.sm,
      marginBottom: theme.spacing.sm,
    },
    profileInfo: {
      flex: 1,
    },
    name: {
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
      fontFamily: theme.typography.fonts.semiBold,
      marginBottom: theme.spacing.xs,
    },
    username: {
      color: theme.colors.text.secondary,
      fontSize: theme.typography.sizes.sm,
    },
    accountsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginLeft: theme.spacing.md,
    },

    profileAndAccountsRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.sm,
    },
    smallAvatars: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    smallAvatar: {
      width: theme.ui.avatar,
      height: theme.ui.avatar,
      borderRadius: theme.ui.avatar / 2,
      marginRight: theme.spacing.xs,
    },
    optionsButton: {
      padding: theme.spacing.xs,
    },
    followRow: {
      flexDirection: 'row',
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    followCount: {
      color: theme.colors.text.secondary,
      marginRight: theme.spacing.md,
    },
    bold: {
      fontFamily: theme.typography.fonts.semiBold,
      color: theme.colors.text.primary,
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: theme.spacing.md,
    },
    tileText: {
      marginLeft: theme.spacing.md,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.md,
    },
    menuTileText: {
      marginLeft: theme.spacing.xl,
      color: theme.colors.text.primary,
      fontSize: theme.typography.sizes.xl,
      fontFamily: theme.typography.fonts.medium,
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.xl,
    },
    animatedBackdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: theme.colors.overlay,
    },
    innerFlex: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    bottomOverlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
    },
    toggleWrapper: {
      position: 'absolute',
      left: theme.spacing.md + theme.spacing.sm,
      top: theme.spacing.sm,
    },
    toggleButton: {
      padding: theme.spacing.xs,
    },
  });

export default React.memo(SideMenu);
