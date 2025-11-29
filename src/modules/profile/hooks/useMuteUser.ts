import { useState } from 'react';
import Toast from 'react-native-toast-message';
import { muteUser, unmuteUser } from '../services/profileService';
export const useMuteUser = (initialMuteState: boolean = false) => {
  const [isMuted, setIsMuted] = useState(initialMuteState);
  const [isLoading, setIsLoading] = useState(false);
  const toggleMute = async (userId: string) => {
    if (isLoading || !userId) return;

    setIsLoading(true);
    const previousState = isMuted;

    // Optimistic update
    setIsMuted(!isMuted);

    try {
      if (isMuted) {
        await unmuteUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Unmuted',
          text2: 'You have unmuted this user',
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        await muteUser(userId);
        Toast.show({
          type: 'success',
          text1: 'Muted',
          text2: 'You have muted this user',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      setIsMuted(previousState);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to update mute status',
        position: 'bottom',
        visibilityTime: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isMuted,
    isLoading,
    toggleMute,
    setIsMuted,
  };
};
