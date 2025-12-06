import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = process.env.EXPO_PUBLIC_USER_STORAGE_KEY;
const REFRESH_TOKEN_KEY = 'refreshToken';
if (!TOKEN_KEY) {
  throw new Error('EXPO_PUBLIC_USER_STORAGE_KEY is not defined in environment variables');
}

/**
 * Saves an authentication token to secure storage
 * @param token - The token to save
 * @throws Error if token is empty or undefined
 */
export const saveToken = async (token: string): Promise<void> => {
  if (!token?.trim()) {
    throw new Error('Token cannot be empty or undefined');
  }
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to save token to secure storage:', error);
    throw new Error('Failed to save authentication token');
  }
};

/**
 * Retrieves the authentication token from secure storage
 * @returns The stored token or null if not found
 */
export const getToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve token from secure storage:', error);
    return null;
  }
};

/**
 * Deletes the authentication token from secure storage
 */
export const deleteToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete token from secure storage:', error);
    throw new Error('Failed to delete authentication token');
  }
};

/**
 * Saves a refresh token to secure storage
 * @param refreshToken - The refresh token to save
 * @throws Error if refresh token is empty or undefined
 */
export const saveRefreshToken = async (refreshToken: string): Promise<void> => {
  if (!refreshToken?.trim()) {
    throw new Error('Refresh token cannot be empty or undefined');
  }
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  } catch (error) {
    console.error('Failed to save refresh token to secure storage:', error);
    throw new Error('Failed to save refresh token');
  }
};

/**
 * Retrieves the refresh token from secure storage
 * @returns The stored refresh token or null if not found
 */
export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve refresh token from secure storage:', error);
    return null;
  }
};

/**
 * Deletes the refresh token from secure storage
 */
export const deleteRefreshToken = async (): Promise<void> => {
  try {
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to delete refresh token from secure storage:', error);
    throw new Error('Failed to delete refresh token');
  }
};
