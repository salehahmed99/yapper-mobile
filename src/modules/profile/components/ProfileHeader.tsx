import { DEFAULT_AVATAR_URL, DEFAULT_BANNER_URL } from '@/src/constants/defaults';
import { formatCount } from '@/src/utils/formatCount';
import { useRouter } from 'expo-router';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useBlockUser } from '../hooks/useBlockUser';
import { useFollowUser } from '../hooks/useFollowUser';
import { useMuteUser } from '../hooks/useMuteUser';
import { getUserById } from '../services/profileService';
import { createHeaderStyles } from '../styles/profile-header-styles';
import { IUserProfile } from '../types';
import { formatDateToDisplay } from '../utils/helper-functions.utils';
import { ImageOrigin, openImageViewer } from '../utils/profile-header.utils';
import AvatarViewer from './AvatarViewer';
import EditProfileModal from './EditProfileModal';
import ProfileActionsMenu from './ProfileActionsMenu';

type ProfileHeaderProps = {
  userId?: string;
  isOwnProfile?: boolean;
};

export default function ProfileHeader({ userId, isOwnProfile = true }: ProfileHeaderProps) {
  const { t } = useTranslation();
  const currentUser = useAuthStore((state) => state.user);

  const [profileUser, setProfileUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [imageUri, setImageUri] = useState(DEFAULT_AVATAR_URL);
  const [bannerUri, setBannerUri] = useState(DEFAULT_BANNER_URL);
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const { theme } = useTheme();
  const headerStyles = useMemo(() => createHeaderStyles(theme), [theme]);

  const router = useRouter();

  const { isFollowing, isLoading: followLoading, toggleFollow, setIsFollowing } = useFollowUser(false);

  const { isBlocked, isLoading: blockLoading, toggleBlock, setIsBlocked } = useBlockUser(false);

  const { isMuted, isLoading: muteLoading, toggleMute, setIsMuted } = useMuteUser(false);

  useEffect(() => {
    if (!isOwnProfile && userId) {
      setLoading(true);
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
          setIsFollowing(data.isFollowing || false);
          setIsMuted(data.isMuted || false);
          setIsBlocked(data.isBlocked || false);
          if (data.avatarUrl) setImageUri(data.avatarUrl);
          if (data.coverUrl) setBannerUri(data.coverUrl);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, isOwnProfile, setIsFollowing, setIsBlocked, setIsMuted]);

  const displayUser = isOwnProfile ? currentUser : profileUser;

  useEffect(() => {
    if (isOwnProfile) {
      setImageUri(currentUser?.avatarUrl || DEFAULT_AVATAR_URL);
    }
  }, [isOwnProfile, currentUser?.avatarUrl]);

  useEffect(() => {
    if (isOwnProfile) {
      setBannerUri(currentUser?.coverUrl || DEFAULT_BANNER_URL);
    }
  }, [isOwnProfile, currentUser?.coverUrl]);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [origin, setOrigin] = useState<ImageOrigin>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avatarRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bannerRef = useRef<any>(null);

  const handleMute = async () => {
    if (!userId || muteLoading) return;
    await toggleMute(userId);
  };

  const handleBlock = async () => {
    if (!userId || blockLoading) return;
    await toggleBlock(userId);
  };

  const handleFollowToggle = async () => {
    if (!userId || followLoading) return;
    await toggleFollow(userId);
    // Refetch user data to update follower count
    if (!isOwnProfile && userId) {
      try {
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
      } catch (error) {
        console.error('Error refreshing user data after follow:', error);
      }
    }
  };

  return (
    <View style={headerStyles.container} testID="profile_header_container">
      {/* Banner */}
      <TouchableOpacity
        testID="profile_header_banner_button"
        activeOpacity={0.95}
        ref={bannerRef}
        onPress={() => {
          if (bannerUri !== DEFAULT_BANNER_URL) {
            openImageViewer(bannerRef, setOrigin, setViewerOpen);
          }
        }}
        disabled={bannerUri === DEFAULT_BANNER_URL}
      >
        {loading || (!isOwnProfile && !profileUser) ? (
          <View style={headerStyles.banner}>
            <ActivityIndicator size="large" color={theme.colors.text.link} />
          </View>
        ) : (
          <Image source={{ uri: bannerUri }} style={headerStyles.banner} testID="profile_header_banner_image" />
        )}

        {/* Back Button */}
        <TouchableOpacity
          testID="profile_header_back_button"
          style={headerStyles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            }
          }}
        >
          <ChevronLeft color="#fff" size={25} />
        </TouchableOpacity>

        {/* Profile Actions */}
        {!isOwnProfile && (
          <TouchableOpacity
            testID="profile_header_actions_button"
            style={headerStyles.actionsButton}
            onPress={() => setActionsMenuOpen(true)}
          >
            <Ellipsis color="#fff" size={25} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Image and button Container */}
      <View style={headerStyles.imageContainer}>
        <TouchableOpacity
          testID="profile_header_avatar_button"
          activeOpacity={0.9}
          ref={avatarRef}
          onPress={() => openImageViewer(avatarRef, setOrigin, setViewerOpen)}
        >
          {loading || (!isOwnProfile && !profileUser) ? (
            <View style={headerStyles.avatar}>
              <ActivityIndicator size="small" color={theme.colors.text.link} />
            </View>
          ) : (
            <Image source={{ uri: imageUri }} style={headerStyles.avatar} testID="profile_header_avatar_image" />
          )}
        </TouchableOpacity>

        {/* Edit or Follow button */}
        {isOwnProfile ? (
          <TouchableOpacity
            testID="profile_header_edit_button"
            style={headerStyles.editButton}
            onPress={() => setEditModalOpen(true)}
          >
            <Text style={headerStyles.editText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            testID="profile_header_follow_button"
            style={[headerStyles.editButton, isFollowing && headerStyles.followingButton]}
            onPress={handleFollowToggle}
            disabled={followLoading}
          >
            {followLoading ? (
              <ActivityIndicator size="small" color={theme.colors.text.primary} />
            ) : (
              <Text style={[headerStyles.editText, isFollowing && headerStyles.followingText]}>
                {isFollowing ? t('profile.following') : t('profile.follow')}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Info */}
      <View style={headerStyles.info} testID="profile_header_info_container">
        {loading || (!isOwnProfile && !profileUser) ? (
          <View style={headerStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.text.link} />
          </View>
        ) : (
          <>
            <Text style={headerStyles.name} testID="profile_header_name">
              {displayUser?.name || 'User'}
            </Text>
            <Text style={headerStyles.handle} testID="profile_header_username">
              @{displayUser?.username || 'username'}
            </Text>
            <Text style={headerStyles.bio} testID="profile_header_bio">
              {displayUser?.bio || t('profile.noBio')}
            </Text>
            <Text style={headerStyles.link} testID="profile_header_joined_date">
              {displayUser?.username} • {t('profile.joined')} {formatDateToDisplay(displayUser?.createdAt || '')}
            </Text>

            {/* Stats */}
            <View style={headerStyles.stats} testID="profile_header_stats_container">
              <TouchableOpacity
                testID="profile_header_following_button"
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  const targetUsername = isOwnProfile ? currentUser?.name : profileUser?.name;
                  router.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    `/(profile)/Lists?tab=following&userId=${targetUserId}&username=${targetUsername}` as any,
                  );
                }}
              >
                <Text style={headerStyles.stat} testID="profile_header_following_count">
                  <Text style={headerStyles.bold}>
                    {formatCount(displayUser?.followingCount || displayUser?.following || 0)}
                  </Text>{' '}
                  {t('profile.following')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID="profile_header_followers_button"
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  const targetUsername = isOwnProfile ? currentUser?.name : profileUser?.name;
                  router.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    `/(profile)/Lists?tab=followers&userId=${targetUserId}&username=${targetUsername}` as any,
                  );
                }}
              >
                <Text style={headerStyles.statWithMargin} testID="profile_header_followers_count">
                  <Text style={headerStyles.bold}>
                    {formatCount(displayUser?.followers || displayUser?.followersCount || 0)}
                  </Text>{' '}
                  {t('profile.followers')}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>

      {/* Edit Profile Modal - Only for own profile */}
      {isOwnProfile && (
        <EditProfileModal
          visible={editModalOpen}
          imageUri={imageUri}
          bannerUri={bannerUri}
          onImageChange={(newUri) => setImageUri(newUri)}
          onBannerChange={(newUri) => setBannerUri(newUri)}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {/* Avatar Viewer */}
      <AvatarViewer
        visible={viewerOpen}
        imageUri={origin && origin.width > 300 ? bannerUri : imageUri}
        origin={origin}
        isBanner={origin ? origin.width > 300 : false}
        onClose={() => setViewerOpen(false)}
        onEditRequested={isOwnProfile ? () => setEditModalOpen(true) : undefined}
      />

      {/* Profile Actions Menu - Only for other profiles */}
      {!isOwnProfile && (
        <ProfileActionsMenu
          visible={actionsMenuOpen}
          onClose={() => setActionsMenuOpen(false)}
          onMute={handleMute}
          onBlock={handleBlock}
          initialMuted={isMuted}
          initialBlocked={isBlocked}
          blockLoading={blockLoading}
        />
      )}
    </View>
  );
}
