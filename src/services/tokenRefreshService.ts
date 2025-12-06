import { getToken, saveToken, getRefreshToken, saveRefreshToken } from '../utils/secureStorage';
import api from './apiClient';

class TokenRefreshService {
  private refreshTimer: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  private readonly MIN_REFRESH_DELAY = 10 * 60 * 1000; // 10 minutes
  private lastRefreshTime = 0;

  start() {
    this.stop();
    this.refreshTimer = setInterval(() => this.refreshToken(), this.MIN_REFRESH_DELAY);
  }

  stop() {
    if (this.refreshTimer) clearInterval(this.refreshTimer);
    this.refreshTimer = null;
    this.isRefreshing = false;
    this.refreshPromise = null;
  }

  async refreshToken(): Promise<string | null> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const now = Date.now();

    if (now - this.lastRefreshTime < this.MIN_REFRESH_DELAY) {
      return await getToken();
    }

    this.isRefreshing = true;
    this.refreshPromise = this._performRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async _performRefresh(): Promise<string | null> {
    try {
      const { useAuthStore } = await import('../store/useAuthStore');

      // Get the refresh token from secure storage
      const refreshToken = await getRefreshToken();
      if (!refreshToken) {
        return null;
      }

      // Send refresh token in request body for mobile
      const response = await api.post('/auth/refresh', {
        refresh_token: refreshToken,
      });

      const newAccessToken = response.data?.data?.accessToken;
      const newRefreshToken = response.data?.data?.refreshToken;

      if (newAccessToken) {
        await saveToken(newAccessToken);
        useAuthStore.setState({ token: newAccessToken });

        // Update the refresh token if a new one was provided (token rotation)
        if (newRefreshToken) {
          await saveRefreshToken(newRefreshToken);
        }

        this.lastRefreshTime = Date.now();
        return newAccessToken;
      }

      return null;
    } catch {
      // console.error('Token refresh failed:', err);
      return null;
    }
  }
}

export const tokenRefreshService = new TokenRefreshService();
