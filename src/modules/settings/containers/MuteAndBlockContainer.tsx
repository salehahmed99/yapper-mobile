import { useNavigation } from '@/src/hooks/useNavigation';
import { getUserRelations } from '@/src/modules/profile/services/profileService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import MuteAndBlockScreen from '../components/MuteAndBlockScreen';

export default function MuteAndBlockContainer() {
  const [blockedCount, setBlockedCount] = useState(0);
  const [mutedCount, setMutedCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const user = useAuthStore((state) => state.user);

  const { navigate } = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const fetchRelations = async () => {
        try {
          setIsLoading(true);
          const data = await getUserRelations();
          setBlockedCount(data.blockedCount);
          setMutedCount(data.mutedCount);
        } catch (error) {
          console.error('Error fetching user relations:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchRelations();
    }, []),
  );

  const handleBlockedAccountsPress = () => {
    navigate('/(protected)/(settings)/MuteAndBlock/Blocked');
  };

  const handleMutedAccountsPress = () => {
    navigate('/(protected)/(settings)/MuteAndBlock/Muted');
  };

  return (
    <MuteAndBlockScreen
      username={user?.username || ''}
      blockedCount={blockedCount}
      mutedCount={mutedCount}
      isLoading={isLoading}
      onBlockedAccountsPress={handleBlockedAccountsPress}
      onMutedAccountsPress={handleMutedAccountsPress}
    />
  );
}
