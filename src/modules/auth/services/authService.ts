import { extractErrorMessage } from '@/src/utils/errorExtraction';
import { getRefreshToken } from '@/src/utils/secureStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import api from '../../../services/apiClient';
import {
  ILoginCredentials,
  ILoginResponse,
  IOAuthBirthDateRequest,
  IOAuthBirthDateResponse,
  IOAuthResponse,
  IOAuthUserNameRequest,
} from '../types';

// Complete auth session when app resumes
WebBrowser.maybeCompleteAuthSession();

const setAuthProvider = async (provider: 'google' | 'github' | 'local' | null) => {
  if (provider) await AsyncStorage.setItem('auth_provider', provider);
  else await AsyncStorage.removeItem('auth_provider');
};

const getAuthProvider = async (): Promise<string | null> => {
  return AsyncStorage.getItem('auth_provider');
};

/* -------------------------------------------------------------------------- */
/*                               Regular Login                                */
/* -------------------------------------------------------------------------- */
export const login = async (credentials: ILoginCredentials): Promise<ILoginResponse> => {
  try {
    const res = await api.post('/auth/login', credentials);
    await setAuthProvider('local');
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const checkExists = async (identifier: string): Promise<boolean> => {
  try {
    const res = await api.post('/auth/check-identifier', { identifier });
    return res.data.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logout = async (): Promise<void> => {
  try {
    const provider = await getAuthProvider();

    if (provider === 'google') {
      await googleSignOut();
    }

    // Get refresh token and send it in the body for mobile
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.warn('Logout API call failed:', extractErrorMessage(error));
      }
    }

    await setAuthProvider(null);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const logOutAll = async (): Promise<void> => {
  try {
    const provider = await getAuthProvider();

    if (provider === 'google') {
      // await googleSignOut();
    }

    // Get refresh token and send it in the body
    const refreshToken = await getRefreshToken();

    // Only make logout-all request if we have a refresh token
    if (refreshToken) {
      try {
        await api.post('/auth/logout-all', { refresh_token: refreshToken });
      } catch (error) {
        // Log the error but don't fail the logout process
        // Token might be already expired or invalid
        console.warn('LogoutAll API call failed:', extractErrorMessage(error));
      }
    }

    await setAuthProvider(null);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/* -------------------------------------------------------------------------- */
/*                               Google Sign-In                               */
/* -------------------------------------------------------------------------- */
const PROXY_URL = 'https://yapper-auth-proxy.vercel.app/api/callback';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!;
const GOOGLE_AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth';

export const googleSignIn = async (): Promise<ILoginResponse | IOAuthResponse> => {
  try {
    // Clear any existing browser session to force fresh login
    await WebBrowser.coolDownAsync();

    // Generate the Local Deep Link
    const localDeepLink = AuthSession.makeRedirectUri({
      scheme: 'yappermobile',
      path: 'redirect',
    });

    // Construct the Auth URL with account selection prompt
    const authUrl =
      `${GOOGLE_AUTH_ENDPOINT}?` +
      `client_id=${GOOGLE_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(PROXY_URL)}` +
      `&state=${encodeURIComponent(localDeepLink)}` +
      `&response_type=code` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&prompt=select_account`;

    // Open the Browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, localDeepLink);
    console.log('Google OAuth result:', result);

    // Handle Cancellation
    if (result.type !== 'success') {
      throw new Error('Google sign-in cancelled');
    }

    // Parse the Code from the URL
    const match = result.url.match(/[?&]code=([^&]+)/);
    const code = match ? match[1] : null;

    if (!code) {
      throw new Error('No authorization code found in redirect');
    }

    // Send code to Backend - let backend handle token exchange with client_secret
    console.log('Sending code to backend...');
    const res = await api.post('/auth/mobile/google', {
      code: code,
      redirect_uri: PROXY_URL,
    });
    console.log('Backend response:', res.data);

    await setAuthProvider('google');

    if (res.data.data.needs_completion) {
      return res.data;
    }
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    // Clear browser session
    await WebBrowser.coolDownAsync();
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/* -------------------------------------------------------------------------- */
/*                               GitHub Sign-In                               */
/* -------------------------------------------------------------------------- */

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!;
const GITHUB_AUTH_ENDPOINT = 'https://github.com/login/oauth/authorize';

export const githubSignIn = async (): Promise<ILoginResponse | IOAuthResponse> => {
  try {
    // Clear any existing browser session to force fresh login
    await WebBrowser.coolDownAsync();
    const localDeepLink = AuthSession.makeRedirectUri({
      scheme: 'yappermobile',
      path: 'redirect',
    });

    // Construct the Auth URL Manually
    // Pass 'localDeepLink' as the 'state' so the Proxy knows where to return
    const authUrl =
      `${GITHUB_AUTH_ENDPOINT}?` +
      `client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(PROXY_URL)}` +
      `&state=${encodeURIComponent(localDeepLink)}` +
      `&scope=${encodeURIComponent('read:user user:email')}` +
      `&prompt=select_account`;

    // Open the Browser
    // The second argument tells the browser to watch for this specific URL and close when detected
    const result = await WebBrowser.openAuthSessionAsync(authUrl, localDeepLink);
    console.log('GitHub OAuth result:', result);

    // Handle Cancellation
    if (result.type !== 'success') {
      throw new Error('GitHub sign-in cancelled');
    }
    console.log('GitHub OAuth success, processing...');

    // Parse the Code from the URL
    // result.url will be: exp://...?code=12345
    const match = result.url.match(/[?&]code=([^&]+)/);
    const code = match ? match[1] : null;
    console.log('Extracted code:', code);

    if (!code) {
      throw new Error('No authorization code found in redirect');
    }

    // Send to Backend
    // 'redirect_uri' sent to backend must match the one sent to GitHub (the Proxy)

    console.log('Sending code to backend for token exchange...');
    const res = await api.post('/auth/mobile/github', {
      code: code,
      redirect_uri: PROXY_URL,
    });
    console.log('Backend response:', res.data);

    await setAuthProvider('github');
    if (res.data.data.needs_completion) {
      return res.data;
    }
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const OAuthStep1 = async (credentials: IOAuthBirthDateRequest): Promise<IOAuthBirthDateResponse> => {
  try {
    const res = await api.post('/auth/oauth/complete/step1', {
      oauth_session_token: credentials.oauthSessionToken,
      birth_date: credentials.birthDate,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const OAuthStep2 = async (credentials: IOAuthUserNameRequest): Promise<ILoginResponse> => {
  try {
    const res = await api.post('/auth/oauth/complete/step2', {
      oauth_session_token: credentials.oauthSessionToken,
      username: credentials.username,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
