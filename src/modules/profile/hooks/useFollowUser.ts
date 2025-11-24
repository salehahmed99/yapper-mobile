import { useAuthStore } from '@/src/store/useAuthStore';
import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { followUser, unfollowUser } from '../services/profileService';

interface UseFollowUserReturn {
  isFollowing: boolean;
  isLoading: boolean;
  toggleFollow: (userId: string) => Promise<void>;
  setIsFollowing: (value: boolean) => void;
}
export const useFollowUser = (initialFollowState: boolean = false): UseFollowUserReturn => {
  const [isFollowing, setIsFollowing] = useState(initialFollowState);
  const [isLoading, setIsLoading] = useState(false);
  const fetchAndUpdateUser = useAuthStore((state) => state.fetchAndUpdateUser);

  const toggleFollow = async (userId: string) => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    const previousState = isFollowing;

    try {
      // Optimistically update UI
      setIsFollowing(!isFollowing);

      if (isFollowing) {
        await unfollowUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Unfollowed',
          text2: 'You have unfollowed this user',
          position: 'bottom',
          visibilityTime: 2000,
        });
        await fetchAndUpdateUser();
      } else {
        await followUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Following',
          text2: 'You are now following this user',
          position: 'bottom',
          visibilityTime: 2000,
        });
        await fetchAndUpdateUser();
      }
    } catch (error) {
      setIsFollowing(previousState);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update follow status';
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isFollowing,
    isLoading,
    toggleFollow,
    setIsFollowing,
  };
};
