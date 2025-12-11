import api from './apiClient';

export const registerDeviceForPushNotifications = async (deviceToken: string) => {
  const response = await api.post('/fcm/token', {
    token: deviceToken,
  });
  return response.data;
};
