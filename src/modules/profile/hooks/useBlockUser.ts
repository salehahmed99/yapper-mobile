import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { blockUser, unblockUser } from '../services/profileService';

export const useBlockUser = (initialBlockState: boolean = false) => {
  const [isBlocked, setIsBlocked] = useState(initialBlockState);
  const [isLoading, setIsLoading] = useState(false);
  const toggleBlock = async (userId: string) => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    const previousState = isBlocked;

    // Optimistic update
    setIsBlocked(!isBlocked);

    try {
      if (isBlocked) {
        await unblockUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Unblocked',
          text2: 'You have unblocked this user',
        });
      } else {
        await blockUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Blocked',
          text2: 'You have blocked this user',
        });
      }
    } catch (error) {
      setIsBlocked(previousState);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'An error occurred',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isBlocked,
    isLoading,
    toggleBlock,
    setIsBlocked,
  };
};
