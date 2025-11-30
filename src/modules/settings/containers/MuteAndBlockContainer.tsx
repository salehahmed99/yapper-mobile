import { useAuthStore } from '@/src/store/useAuthStore';
import { useRouter } from 'expo-router';
import React from 'react';
import MuteAndBlockScreen from '../components/MuteAndBlockScreen';

export default function MuteAndBlockContainer() {
  // TODO: Get actual blocked count from store
  const blockedCount = 12;
  const mutedCount = 2;
  const user = useAuthStore((state) => state.user);

  const router = useRouter();

  const handleBlockedAccountsPress = () => {
    router.push('/(protected)/(settings)/MuteAndBlock/Blocked');
  };

  const handleMutedAccountsPress = () => {
    router.push('/(protected)/(settings)/MuteAndBlock/Muted');
  };

  return (
    <MuteAndBlockScreen
      username={user?.username || ''}
      blockedCount={blockedCount}
      mutedCount={mutedCount}
      onBlockedAccountsPress={handleBlockedAccountsPress}
      onMutedAccountsPress={handleMutedAccountsPress}
    />
  );
}
