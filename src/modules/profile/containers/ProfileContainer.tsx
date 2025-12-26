import { DEFAULT_BANNER_URL } from '@/src/constants/defaults';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Animated, Easing, LogBox, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import { ProfilePostsProvider, useProfilePosts } from '../context/ProfilePostsContext';
import { getUserById, getUserByUsername } from '../services/profileService';
import { createContainerStyles } from '../styles/container-style';
import { createHeaderStyles } from '../styles/profile-header-styles';
import { IUserProfile } from '../types';

LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);

type ProfileContainerProps = {
  userId?: string;
  username?: string;
  isOwnProfile?: boolean;
};
const PROFILE_HEADER_HEIGHT = 420;

function ProfileContainerInner({ userId, username, isOwnProfile = true }: ProfileContainerProps) {
  const { theme } = useTheme();
  const containerStyles = useMemo(() => createContainerStyles(theme), [theme]);
  const headerStyles = useMemo(() => createHeaderStyles(theme), [theme]);
  const blockedStyles = useMemo(
    () =>
      StyleSheet.create({
        blockedContainer: {
          marginTop: theme.spacing.xl * 2,
          paddingHorizontal: theme.spacing.lg,
        },
        blockedTitle: {
          color: theme.colors.text.primary,
          fontSize: theme.typography.sizes.xl,
          fontWeight: theme.typography.weights.bold,
          marginBottom: theme.spacing.md,
        },
        blockedDesc: {
          color: theme.colors.text.secondary,
          fontSize: theme.typography.sizes.md,
          marginBottom: theme.spacing.lg,
        },
        animatedHeader: {},
      }),
    [theme],
  );
  const scrollY = useRef(new Animated.Value(0)).current;
  const { triggerRefresh } = useProfilePosts();

  const currentUser = useAuthStore((state) => state.user);
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);
  const [profileUser, setProfileUser] = useState<IUserProfile | null>(null);

  function handleBlockStateChange(blocked: boolean) {
    setProfileUser((prev) => (prev ? { ...prev, isBlocked: blocked } : prev));
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [bannerUri, setBannerUri] = useState(
    isOwnProfile ? currentUser?.coverUrl || DEFAULT_BANNER_URL : DEFAULT_BANNER_URL,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (!isOwnProfile && (userId || username)) {
      const fetchUser = userId ? getUserById(userId) : getUserByUsername(username!);
      fetchUser
        .then((data) => {
          const mappedUser: IUserProfile = {
            id: data.userId,
            email: '',
            name: data.name,
            username: data.username,
            bio: data.bio,
            avatarUrl: data.avatarUrl,
            coverUrl: data.coverUrl || null,
            country: data.country,
            createdAt: data.createdAt,
            followers: data.followersCount,
            following: data.followingCount,
            followersCount: data.followersCount,
            followingCount: data.followingCount,
            isFollower: data.isFollower,
            isFollowing: data.isFollowing,
            isMuted: data.isMuted,
            isBlocked: data.isBlocked,
            topMutualFollowers: data.topMutualFollowers,
            mutualFollowersCount: parseInt(data.mutualFollowersCount, 10) || 0,
            birthDate: '',
          };
          setProfileUser(mappedUser);
          if (data.coverUrl) setBannerUri(data.coverUrl);
        })
        .catch((error) => {
          console.error('Error fetching user for animated header:', error);
        });
    }
  }, [userId, username, isOwnProfile, profileUser?.isBlocked]);

  useEffect(() => {
    if (isOwnProfile) {
      setBannerUri(currentUser?.coverUrl || DEFAULT_BANNER_URL);
    }
  }, [isOwnProfile, currentUser?.coverUrl]);

  const displayUser = isOwnProfile ? currentUser : profileUser;
  const isLoading = (!isOwnProfile && !profileUser) || (isOwnProfile && !currentUser);
  const isBlocked = !!displayUser?.isBlocked;
  const [showTabs, setShowTabs] = useState(false);
  const blockedAnim = useRef(new Animated.Value(0)).current;
  const tabsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isBlocked) {
      setShowTabs(false);
      Animated.timing(blockedAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
      Animated.timing(tabsAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
    } else {
      setShowTabs(true);
      Animated.timing(blockedAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }).start();
      Animated.timing(tabsAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }).start();
    }
  }, [isBlocked, blockedAnim, tabsAnim]);
  const { t } = useTranslation();

  useEffect(() => {
    scrollY.setValue(0);
  }, [scrollY]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOwnProfile) {
        await fetchAndUpdateUser();
      } else if (userId || username) {
        const data = userId ? await getUserById(userId) : await getUserByUsername(username!);
        const mappedUser: IUserProfile = {
          id: data.userId,
          email: '',
          name: data.name,
          username: data.username,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          coverUrl: data.coverUrl || null,
          country: data.country,
          createdAt: data.createdAt,
          followers: data.followersCount,
          following: data.followingCount,
          followersCount: data.followersCount,
          followingCount: data.followingCount,
          isFollower: data.isFollower,
          isFollowing: data.isFollowing,
          isMuted: data.isMuted,
          isBlocked: data.isBlocked,
          topMutualFollowers: data.topMutualFollowers,
          mutualFollowersCount: parseInt(data.mutualFollowersCount, 10) || 0,
          birthDate: '',
        };
        setProfileUser(mappedUser);
        if (data.coverUrl) setBannerUri(data.coverUrl);
      }
      setRefreshKey((prev) => prev + 1);
      triggerRefresh();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const profileHeaderTranslateY = scrollY.interpolate({
    inputRange: [0, 300, 500],
    outputRange: [0, -100, -PROFILE_HEADER_HEIGHT / 2],
    extrapolate: 'clamp',
  });

  const profileHeaderOpacity = scrollY.interpolate({
    inputRange: [0, 250, 400, 500],
    outputRange: [1, 0.8, 0.3, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={containerStyles.container}>
      <ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        showsVerticalScrollIndicator={false}
        style={{}}
        contentContainerStyle={containerStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.colors.text.link}
            colors={[theme.colors.text.link]}
            progressViewOffset={80}
            progressBackgroundColor={theme.colors.background.primary}
          />
        }
      >
        <Animated.View
          style={[
            blockedStyles.animatedHeader,
            {
              transform: [{ translateY: profileHeaderTranslateY }],
              opacity: profileHeaderOpacity,
            },
          ]}
        >
          <ProfileHeader
            key={refreshKey}
            userId={userId || profileUser?.id}
            isOwnProfile={isOwnProfile}
            onBlockStateChange={handleBlockStateChange}
          />
        </Animated.View>
        {!isLoading && isBlocked && !showTabs && (
          <Animated.View
            style={[
              blockedStyles.blockedContainer,
              {
                opacity: blockedAnim,
                transform: [
                  {
                    translateY: blockedAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [theme.spacing.xl, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={blockedStyles.blockedTitle}>
              {t('profile.blockedUser', { username: displayUser?.username })}
            </Text>
            <Text style={blockedStyles.blockedDesc}>
              {t('profile.blockedUserDescription', { username: displayUser?.username })}
            </Text>
            <TouchableOpacity style={headerStyles.viewPostsButton} onPress={() => setShowTabs(true)}>
              <Text style={headerStyles.viewPostsText}>{t('profile.viewPosts')}</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </ScrollView>
      {!isLoading && (!isBlocked || showTabs) && (
        <Animated.View
          style={[
            containerStyles.tabsContainer,
            {
              opacity: tabsAnim,
              transform: [
                {
                  translateY: tabsAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [theme.spacing.xl, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <ProfileTabs userId={userId} />
        </Animated.View>
      )}
    </View>
  );
}

export default function ProfileContainer(props: ProfileContainerProps) {
  return (
    <ProfilePostsProvider>
      <MediaViewerProvider>
        <ProfileContainerInner {...props} />
        <MediaViewerModal />
      </MediaViewerProvider>
    </ProfilePostsProvider>
  );
}
