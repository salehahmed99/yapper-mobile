import axios from 'axios';
import { router } from 'expo-router';
import { deleteToken, getToken } from '../utils/secureStorage';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;

    const requestUrl = error?.config?.url;

    // check for unauthorized or forbidden
    if ((status === 401 || status === 403) && requestUrl && !requestUrl.includes('/login')) {
      await deleteToken();
      router.replace('/(auth)/landing-screen');
    }

    return Promise.reject(error);
  },
);

export default api;
