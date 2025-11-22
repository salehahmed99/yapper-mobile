import { DEFAULT_BANNER_URL } from '@/src/constants/defaults';
import { MediaViewerProvider } from '@/src/context/MediaViewerContext';
import MediaViewerModal from '@/src/modules/tweets/components/MediaViewerModal';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, LogBox, RefreshControl, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import AnimatedProfileHeader from '../components/AnimatedProfileHeader';
import ProfileHeader from '../components/ProfileHeader';
import ProfileTabs from '../components/ProfileTabs';
import { ProfilePostsProvider, useProfilePosts } from '../context/ProfilePostsContext';
import { getUserById } from '../services/profileService';
import { createContainerStyles } from '../styles/container-style';
import { IUserProfile } from '../types';

// Suppress VirtualizedList warning for nested ScrollView in profile tabs
LogBox.ignoreLogs(['VirtualizedLists should never be nested inside plain ScrollViews']);

type ProfileContainerProps = {
  userId?: string;
  isOwnProfile?: boolean;
};

const ANIMATED_HEADER_HEIGHT = 90;
const PROFILE_HEADER_HEIGHT = 420; // Approximate height of ProfileHeader

function ProfileContainerInner({ userId, isOwnProfile = true }: ProfileContainerProps) {
  const { theme } = useTheme();
  const containerStyles = useMemo(() => createContainerStyles(theme), [theme]);
  const scrollY = useRef(new Animated.Value(0)).current;
  const { triggerRefresh } = useProfilePosts();

  const currentUser = useAuthStore((state) => state.user);
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);
  const [profileUser, setProfileUser] = useState<IUserProfile | null>(null);
  const [bannerUri, setBannerUri] = useState(
    isOwnProfile ? currentUser?.coverUrl || DEFAULT_BANNER_URL : DEFAULT_BANNER_URL,
  );
  const [refreshing, setRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch user data if it's another user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      getUserById(userId)
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
  }, [userId, isOwnProfile]);

  // Update bannerUri when user data changes (for own profile)
  useEffect(() => {
    if (isOwnProfile) {
      setBannerUri(currentUser?.coverUrl || DEFAULT_BANNER_URL);
    }
  }, [isOwnProfile, currentUser?.coverUrl]);

  const displayUser = isOwnProfile ? currentUser : profileUser;
  const username = displayUser?.name || 'User';

  // Reset scroll position when component mounts
  useEffect(() => {
    scrollY.setValue(0);
  }, [scrollY]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (isOwnProfile) {
        await fetchAndUpdateUser();
      } else if (userId) {
        const data = await getUserById(userId);
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
      // Increment refresh key to force ProfileHeader to update
      setRefreshKey((prev) => prev + 1);
      // Trigger refresh of tweets/posts
      triggerRefresh();
    } catch (error) {
      console.error('Error refreshing profile:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Animate ProfileHeader to slide up and fade out
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
      <AnimatedProfileHeader
        username={username}
        bannerUri={bannerUri}
        scrollY={scrollY}
        headerHeight={ANIMATED_HEADER_HEIGHT}
      />
      <Animated.ScrollView
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        showsVerticalScrollIndicator={false}
        style={containerStyles.scrollView}
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
          style={{
            transform: [{ translateY: profileHeaderTranslateY }],
            opacity: profileHeaderOpacity,
          }}
        >
          <ProfileHeader key={refreshKey} userId={userId} isOwnProfile={isOwnProfile} />
        </Animated.View>
        <View style={containerStyles.tabsContainer}>
          <ProfileTabs userId={userId} />
        </View>
      </Animated.ScrollView>
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
