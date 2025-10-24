import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = process.env.EXPO_PUBLIC_USER_STORAGE_KEY;
if (!TOKEN_KEY) {
  throw new Error('EXPO_PUBLIC_USER_STORAGE_KEY is not defined in environment variables');
}

export const saveToken = async (token: string) => {
  if (!token) {
    throw new Error('Token is empty or undefined');
  }
  await SecureStore.setItemAsync(TOKEN_KEY, token);
};

export const getToken = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

export const deleteToken = async () => {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
};
