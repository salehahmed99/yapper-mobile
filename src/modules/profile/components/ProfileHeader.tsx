import { useRouter } from 'expo-router';
import { ChevronLeft, Ellipsis } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, Image, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { useAuthStore } from '../../../store/useAuthStore';
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
  const currentUser = useAuthStore((state) => state.user);

  const [profileUser, setProfileUser] = useState<IUserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [imageUri, setImageUri] = useState('https://randomuser.me/api/portraits/men/1.jpg');
  const [bannerUri, setBannerUri] = useState('https://picsum.photos/1200/400');
  const [actionsMenuOpen, setActionsMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const { theme } = useTheme();
  const headerStyles = useMemo(() => createHeaderStyles(theme), [theme]);

  const router = useRouter();

  // Fetch user data if it's another user's profile
  useEffect(() => {
    if (!isOwnProfile && userId) {
      setLoading(true);
      getUserById(userId)
        .then((response) => {
          setProfileUser(response.data);
          setIsFollowing(response.data.isFollowing);
          setIsMuted(response.data.isMuted);
          setIsBlocked(response.data.isBlocked);
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
  }, [userId, isOwnProfile]);

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

  const handleMute = () => {
    setIsMuted(!isMuted);
    // TODO: Implement mute functionality
    // console.log(isMuted ? "User unmuted" : "User muted");
  };

  const handleBlock = () => {
    setIsBlocked(!isBlocked);
    // TODO: Implement block functionality
    // console.log(isBlocked ? "User unblocked" : "User blocked");
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
        <TouchableOpacity style={headerStyles.backButton} onPress={() => router.back()}>
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
            <Text style={headerStyles.editText}>Edit profile</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[headerStyles.editButton, isFollowing && headerStyles.followingButton]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={[headerStyles.editText, isFollowing && headerStyles.followingText]}>
              {isFollowing ? 'Following' : 'Follow'}
            </Text>
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
            <Text style={headerStyles.bio}>{displayUser?.bio || 'No bio available'}</Text>
            <Text style={headerStyles.link}>
              {displayUser?.username} • Joined {formatDateToDisplay(displayUser?.createdAt || '')}
            </Text>

            {/* Stats */}
            <View style={headerStyles.stats}>
              <TouchableOpacity
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  router.push(`/(profile)/Lists?tab=following&userId=${targetUserId}`);
                }}
              >
                <Text style={headerStyles.stat}>
                  <Text style={headerStyles.bold}>{displayUser?.following || 0}</Text> Following
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const targetUserId = isOwnProfile ? currentUser?.id : userId;
                  router.push(`/(profile)/Lists?tab=followers&userId=${targetUserId}`);
                }}
              >
                <Text style={headerStyles.statWithMargin}>
                  <Text style={headerStyles.bold}>{displayUser?.followers || 0}</Text> Followers
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
        />
      )}
    </View>
  );
}
