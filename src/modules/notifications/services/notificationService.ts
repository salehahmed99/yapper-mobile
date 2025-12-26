import api from '@/src/services/apiClient';
import { INotifications, INotificationsResponse } from '../types';

export const registerDeviceForPushNotifications = async (deviceToken: string) => {
  try {
    const response = await api.post('/fcm/token', {
      token: deviceToken,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to register device for push notifications', error);
    return null;
  }
};

export const getNotifications = async (filters: { page: number }): Promise<INotifications> => {
  const response = await api.get<INotificationsResponse>('/notifications', {
    params: {
      page: filters.page,
    },
  });
  return response.data.data;
};

export const getMentions = async (filters: { page: number }): Promise<INotifications> => {
  const response = await api.get<INotificationsResponse>('/notifications/mentions', {
    params: {
      page: filters.page,
    },
  });
  return response.data.data;
};
