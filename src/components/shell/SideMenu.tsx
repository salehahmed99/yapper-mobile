import { useTheme } from '@/src/context/ThemeContext';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  CircleEllipsis,
  Download,
  LayoutList,
  MessageCircle,
  Settings,
  Sparkles,
  User,
  Users,
  Video,
} from 'lucide-react-native';
import React from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiShell } from './UiShellContext';

export const drawerWidth = 320;

interface ISideMenuProps {
  anim: Animated.Value;
}

const SideMenu: React.FC<ISideMenuProps> = (props) => {
  const { anim } = props;
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const router = useRouter();
  const { isSideMenuOpen, closeSideMenu } = useUiShell();
  const pathname = require('expo-router').usePathname();
  const insets = useSafeAreaInsets();

  function navigate(path: string) {
    // If already on target path, just close menu
    if (pathname === path) {
      closeSideMenu();
      return;
    }
    closeSideMenu();
    router.push(path as any);
  }

  React.useEffect(() => {
    if (isSideMenuOpen) {
      Animated.timing(anim, {
        toValue: drawerWidth,
        duration: 250,
        useNativeDriver: false,
      }).start();
    }
  }, [isSideMenuOpen]);

  return (
    <Animated.View
      style={[StyleSheet.absoluteFill, { flexDirection: 'row' }]}
      pointerEvents={isSideMenuOpen ? 'auto' : 'none'}
      accessibilityElementsHidden={!isSideMenuOpen}
      importantForAccessibility={isSideMenuOpen ? 'yes' : 'no-hide-descendants'}
    >
      <Animated.View
        style={[styles.drawer, { left: Animated.subtract(anim, drawerWidth), opacity: isSideMenuOpen ? 1 : 0 }]}
      >
        <View
          style={{
            flex: 1,
            paddingTop: insets.top + theme.spacing.sm,
            paddingStart: theme.spacing.sm,
          }}
        >
          {/* Profile + other accounts in one row */}
          <View style={styles.profileAndAccountsRow}>
            <View style={styles.profileCol}>
              <Image source={{ uri: 'https://randomuser.me/api/portraits/men/1.jpg' }} style={styles.avatar} />
              <Text style={styles.name}>Pixsellz</Text>
              <Text style={styles.username}>@pixsellz</Text>
            </View>

            <View style={styles.accountsRow}>
              <View style={styles.smallAvatars}>
                <Image source={{ uri: 'https://randomuser.me/api/portraits/women/2.jpg' }} style={styles.smallAvatar} />
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/3.jpg' }} style={styles.smallAvatar} />
              </View>
              <TouchableOpacity style={styles.optionsButton} onPress={() => {}}>
                <CircleEllipsis color={theme.colors.text.primary} size={32} />
              </TouchableOpacity>
            </View>
          </View>

          {/* followers/following */}
          <View style={styles.followRow}>
            <Text style={styles.followCount}>
              <Text style={styles.bold}>217</Text> Following
            </Text>
            <Text style={styles.followCount}>
              <Text style={styles.bold}>118</Text> Followers
            </Text>
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 75 + insets.bottom }}>
            {/* Menu tiles */}
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/(profile)')}>
              <User color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/premium')}>
              <Sparkles color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Premium</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/videos')}>
              <Video color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Videos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/chat')}>
              <MessageCircle color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/communities')}>
              <Users color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Communities</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/bookmarks')}>
              <Bookmark color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Bookmarks</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/lists')}>
              <LayoutList color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Lists</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/spaces')}>
              <User color={theme.colors.text.primary} size={28} />
              <Text style={styles.menuTileText}>Spaces</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            {/* Utility links */}
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/download')}>
              <Download color={theme.colors.text.primary} size={18} />
              <Text style={styles.tileText}>Download Grok</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/settings')}>
              <Settings color={theme.colors.text.primary} size={18} />
              <Text style={styles.tileText}>Settings & Privacy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/help')}>
              <User color={theme.colors.text.primary} size={18} />
              <Text style={styles.tileText}>Help Center</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.tile} onPress={() => navigate('/purchases')}>
              <Download color={theme.colors.text.primary} size={18} />
              <Text style={styles.tileText}>Purchases</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Bottom overlay */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: 48 + insets.bottom,
            backgroundColor: `${theme.colors.background.primary}CF`,
          }}
        />
      </Animated.View>
    </Animated.View>
  );
};

const createStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    drawer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      width: drawerWidth,
      left: 0,
      backgroundColor: theme.colors.background.primary,
      paddingTop: theme.spacing.xl,
      paddingHorizontal: theme.spacing.lg,
      shadowColor: '#000',
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
      width: 56,
      height: 56,
      borderRadius: 28,
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
      width: 32,
      height: 32,
      borderRadius: 18,
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
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: theme.colors.border,
      marginVertical: theme.spacing.md,
    },
    animatedBackdrop: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,1)',
    },
  });

export default React.memo(SideMenu);
