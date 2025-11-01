import { useRouter } from 'expo-router';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
import { useBlockUser } from '../hooks/useBlockUser';
import { useFollowUser } from '../hooks/useFollowUser';
import { getUserById, muteUser, unmuteUser } from '../services/profileService';
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
  const [imageUri, setImageUri] = useState('https://randomuser.me/api/portraits/men/1.jpg');
  const [bannerUri, setBannerUri] = useState('https://picsum.photos/1200/400');
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const { theme } = useTheme();
  const headerStyles = useMemo(() => createHeaderStyles(theme), [theme]);

  const router = useRouter();

  // Use follow hook for managing follow state
  const { isFollowing, isLoading: followLoading, toggleFollow, setIsFollowing } = useFollowUser(false);

  // Use block hook for managing block state
  const { isBlocked, isLoading: blockLoading, toggleBlock, setIsBlocked } = useBlockUser(false);

  // Fetch user data if it's another user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      setLoading(true);
      getUserById(userId)
        .then((response) => {
          setProfileUser(response.data);
          setIsFollowing(response.data.isFollowing || false);
          setIsMuted(response.data.isMuted || false);
          setIsBlocked(response.data.isBlocked || false);
          if (response.data.avatarUrl) setImageUri(response.data.avatarUrl);
          if (response.data.coverUrl) setBannerUri(response.data.coverUrl);
        })
        .catch((error) => {
          console.error('Error fetching user:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [userId, isOwnProfile, setIsFollowing, setIsBlocked]);

  // Use currentUser for own profile, profileUser for others
  const displayUser = isOwnProfile ? currentUser : profileUser;

  // Update imageUri when user data changes (for own profile)
  useEffect(() => {
    if (isOwnProfile && currentUser?.avatarUrl) {
      setImageUri(currentUser.avatarUrl);
    }
  }, [isOwnProfile, currentUser?.avatarUrl]);

  // Update bannerUri when user data changes (for own profile)
  useEffect(() => {
    if (isOwnProfile && currentUser?.coverUrl) {
      setBannerUri(currentUser.coverUrl);
    }
  }, [isOwnProfile, currentUser?.coverUrl]);

  // Media Related States
  const [viewerOpen, setViewerOpen] = useState(false);
  const [origin, setOrigin] = useState<ImageOrigin>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const avatarRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bannerRef = useRef<any>(null);

  const handleMute = async () => {
    if (!userId) return;

    try {
      if (isMuted) {
        await unmuteUser(userId);
        setIsMuted(false);
        Toast.show({
          type: 'success',
          text1: t('profile.toasts.userUnmuted'),
          text2: t('profile.toasts.userUnmutedDesc'),
          position: 'bottom',
        });
      } else {
        await muteUser(userId);
        setIsMuted(true);
        Toast.show({
          type: 'success',
          text1: t('profile.toasts.userMuted'),
          text2: t('profile.toasts.userMutedDesc'),
          position: 'bottom',
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update mute status';
      Toast.show({
        type: 'error',
        text1: t('profile.toasts.error'),
        text2: errorMessage,
        position: 'bottom',
      });
    }
  };

  const handleBlock = async () => {
    if (!userId || blockLoading) return;
    await toggleBlock(userId);
  };

  const handleFollowToggle = async () => {
    if (!userId || followLoading) return;
    await toggleFollow(userId);
  };

  return (
    <View style={headerStyles.container}>
      {/* Banner */}
      <TouchableOpacity
        activeOpacity={0.95}
        ref={bannerRef}
        onPress={() => openImageViewer(bannerRef, setOrigin, setViewerOpen)}
      >
        {loading || (!isOwnProfile && !profileUser) ? (
          <View style={headerStyles.banner}>
            <ActivityIndicator size="large" color={theme.colors.text.link} />
          </View>
        ) : (
          <Image source={{ uri: bannerUri }} style={headerStyles.banner} />
        )}

        {/* Back Button */}
        <TouchableOpacity
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
          <TouchableOpacity style={headerStyles.actionsButton} onPress={() => setActionsMenuOpen(true)}>
            <Ellipsis color="#fff" size={25} />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* Image and button Container */}
      <View style={headerStyles.imageContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          ref={avatarRef}
          onPress={() => openImageViewer(avatarRef, setOrigin, setViewerOpen)}
        >
          {loading || (!isOwnProfile && !profileUser) ? (
            <View style={headerStyles.avatar}>
              <ActivityIndicator size="small" color={theme.colors.text.link} />
            </View>
          ) : (
            <Image source={{ uri: imageUri }} style={headerStyles.avatar} />
          )}
        </TouchableOpacity>

        {/* Edit or Follow button */}
        {isOwnProfile ? (
          <TouchableOpacity style={headerStyles.editButton} onPress={() => setEditModalOpen(true)}>
            <Text style={headerStyles.editText}>{t('profile.editProfile')}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
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
      <View style={headerStyles.info}>
        {loading || (!isOwnProfile && !profileUser) ? (
          <View style={headerStyles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.text.link} />
          </View>
        ) : (
          <>
            <Text style={headerStyles.name}>{displayUser?.name || 'User'}</Text>
            <Text style={headerStyles.handle}>@{displayUser?.username || 'username'}</Text>
            <Text style={headerStyles.bio}>{displayUser?.bio || t('profile.noBio')}</Text>
            <Text style={headerStyles.link}>
              {displayUser?.username} • {t('profile.joined')} {formatDateToDisplay(displayUser?.createdAt || '')}
            </Text>

            {/* Stats */}
            <View style={headerStyles.stats}>
              <TouchableOpacity
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  const targetUsername = isOwnProfile ? currentUser?.name : profileUser?.name;
                  router.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    `/(profile)/Lists?tab=following&userId=${targetUserId}&username=${targetUsername}` as any,
                  );
                }}
              >
                <Text style={headerStyles.stat}>
                  <Text style={headerStyles.bold}>{displayUser?.following || 0}</Text> {t('profile.following')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  const targetUsername = isOwnProfile ? currentUser?.name : profileUser?.name;
                  router.push(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    `/(profile)/Lists?tab=followers&userId=${targetUserId}&username=${targetUsername}` as any,
                  );
                }}
              >
                <Text style={headerStyles.statWithMargin}>
                  <Text style={headerStyles.bold}>{displayUser?.followers || 0}</Text> {t('profile.followers')}
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
