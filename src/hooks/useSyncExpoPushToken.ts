import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { registerDeviceForPushNotifications } from '../modules/notifications/services/notificationService';
import { registerForPushNotificationsAsync } from '../utils/registerForPushNotificationsAsync';

const useSyncExpoPushToken = () => {
  useEffect(() => {
    const syncPushToken = async () => {
      try {
        // 1. Get the current token from Expo/Apple/Google
        const newToken = await registerForPushNotificationsAsync();
        if (!newToken) return;

        // 2. Optimization: Check if we already sent this token to the backend
        const storedToken = await AsyncStorage.getItem('PUSH_TOKEN_SYNCED');

        if (newToken !== storedToken) {
          // 3. Only hit the backend if the token is new or changed
          console.warn('Push Token changed or not synced. Sending to backend...');

          const result = await registerDeviceForPushNotifications(newToken);

          // 4. If backend success, save it locally so we don't spam the API next time
          if (result) {
            await AsyncStorage.setItem('PUSH_TOKEN_SYNCED', newToken);
          }
        } else {
          console.warn('Push token already up to date.');
        }
      } catch (error) {
        console.error('Error syncing push token:', error);
      }
    };

    syncPushToken();
  }, []);
};

export default useSyncExpoPushToken;
