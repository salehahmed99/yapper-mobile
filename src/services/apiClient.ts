import axios from 'axios';
import { router } from 'expo-router';
import humps from 'humps';
import { getToken } from '../utils/secureStorage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    // Skip transformation for FormData (file uploads) to prevent corruption
    if (!(config.data instanceof FormData)) {
      config.data = humps.decamelizeKeys(config.data);
    }
    config.params = humps.decamelizeKeys(config.params);
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => {
    response.data = humps.camelizeKeys(response.data);
    return response;
  },
  async (error) => {
    const status = error?.response?.status;

    const requestUrl = error?.config?.url;

    // check for unauthorized or forbidden
    if ((status === 401 || status === 403) && requestUrl && !requestUrl.includes('/login')) {
      const { useAuthStore } = await import('../store/useAuthStore');
      useAuthStore.getState().logout();
      router.replace('/(auth)/landing-screen');
    }

    return Promise.reject(error);
  },
);

export default api;
