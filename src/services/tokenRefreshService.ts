import { router } from 'expo-router';
import { getToken, saveToken, deleteToken } from '../utils/secureStorage';
import api from './apiClient';

class TokenRefreshService {
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;

  private readonly REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes
  private readonly MIN_REFRESH_DELAY = 5 * 60 * 1000; // 5 minutes
  private lastRefreshTime = 0;

  start() {
    this.stop();
    this.refreshTimer = setInterval(() => this.refreshToken(), this.REFRESH_INTERVAL);
  }

  stop() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
    this.isRefreshing = false;
  }

  async refreshToken(): Promise<string | null> {
    const now = Date.now();
    if (now - this.lastRefreshTime < this.MIN_REFRESH_DELAY || this.isRefreshing) return null;

    this.isRefreshing = true;

    try {
      const token = await getToken();
      if (!token) return null;

      const response = await api.post('/auth/refresh');
      const newToken = response.data?.data?.access_token;

      if (newToken) {
        await saveToken(newToken);
        this.lastRefreshTime = now;
        return newToken;
      }

      return null;
    } catch (err) {
      console.error('Token refresh failed:', err);
      await deleteToken();
      router.replace('/(auth)/landing-screen');
      return null;
    } finally {
      this.isRefreshing = false;
    }
  }
}

export const tokenRefreshService = new TokenRefreshService();
