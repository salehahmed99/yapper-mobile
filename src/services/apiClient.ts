import axios from 'axios';
import { router } from 'expo-router';
import humps from 'humps';
import { deleteToken, getToken } from '../utils/secureStorage';

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
    const originalRequest = error?.config;
    const requestUrl = originalRequest?.url;

    // Handle 401/403 errors
    if (
      (status === 401 || status === 403) &&
      requestUrl &&
      !requestUrl.includes('/login') &&
      !requestUrl.includes('/refresh')
    ) {
      if (originalRequest._retry === true) {
        await _handleLogout();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const { tokenRefreshService } = await import('./tokenRefreshService');
        const newToken = await tokenRefreshService.refreshToken();

        if (newToken) {
          return api(originalRequest);
        } else {
          await _handleLogout();
          return Promise.reject(error);
        }
      } catch {
        await _handleLogout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

async function _handleLogout() {
  await deleteToken();
  const { useAuthStore } = await import('../store/useAuthStore');
  useAuthStore.getState().logout();
  router.replace('/(auth)/landing-screen');
}

export default api;
