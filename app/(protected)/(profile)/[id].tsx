import ProfileContainer from '@/src/modules/profile/containers/ProfileContainer';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);

  // Detect if id is a UUID or username
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const isOwnProfile = currentUser?.id === id || currentUser?.username === id;

  return (
    <ProfileContainer
      userId={isUUID ? id : undefined}
      username={!isUUID ? id : undefined}
      isOwnProfile={isOwnProfile}
    />
  );
}
