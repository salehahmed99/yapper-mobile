import { socketService } from '@/src/services/socketService';
import { useAuthStore } from '@/src/store/useAuthStore';
import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';

export const useSocketConnection = () => {
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = !!useAuthStore((state) => state.user);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Only connect if initialized and authenticated
    if (!isInitialized || !isAuthenticated) return;

    const connectSocket = async () => {
      try {
        await socketService.connect();
      } catch (error) {
        console.error('[useSocketConnection] Connection failed:', error);
      }
    };

    connectSocket();

    // Handle AppState changes
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        socketService.connect();
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        socketService.disconnect();
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
      socketService.disconnect();
    };
  }, [isInitialized, isAuthenticated]);
};
