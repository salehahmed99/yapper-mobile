import ProfileContainer from '@/src/modules/profile/containers/ProfileContainer';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useLocalSearchParams } from 'expo-router';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const currentUser = useAuthStore((state) => state.user);
  const isOwnProfile = currentUser?.id === id;

  return <ProfileContainer userId={id} isOwnProfile={isOwnProfile} />;
}
