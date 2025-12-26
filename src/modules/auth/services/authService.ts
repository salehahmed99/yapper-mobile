import { extractErrorMessage } from '@/src/utils/errorExtraction';
import { getRefreshToken } from '@/src/utils/secureStorage';
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

/* -------------------------------------------------------------------------- */
/*                               Regular Login                                */
/* -------------------------------------------------------------------------- */
export const login = async (credentials: ILoginCredentials): Promise<ILoginResponse> => {
  try {
    const res = await api.post('/auth/login', credentials);
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
    const refreshToken = await getRefreshToken();
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.warn('Logout API call failed:', extractErrorMessage(error));
      }
    }
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/* -------------------------------------------------------------------------- */
/*                               Google Sign-In                               */
/* -------------------------------------------------------------------------- */
const PROXY_URL = process.env.EXPO_PUBLIC_REDIRECT_URI!;

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

    const res = await api.post('/auth/mobile/google', {
      code: code,
      redirect_uri: PROXY_URL,
    });

    if (res.data.data.needs_completion) {
      return res.data;
    }
    return res.data;
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
    await WebBrowser.coolDownAsync();
    const localDeepLink = AuthSession.makeRedirectUri({
      scheme: 'yappermobile',
      path: 'redirect',
    });

    const authUrl =
      `${GITHUB_AUTH_ENDPOINT}?` +
      `client_id=${GITHUB_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(PROXY_URL)}` +
      `&state=${encodeURIComponent(localDeepLink)}` +
      `&scope=${encodeURIComponent('read:user user:email')}` +
      `&prompt=select_account`;

    const result = await WebBrowser.openAuthSessionAsync(authUrl, localDeepLink);

    // Handle Cancellation
    if (result.type !== 'success') {
      throw new Error('GitHub sign-in cancelled');
    }

    const match = result.url.match(/[?&]code=([^&]+)/);
    const code = match ? match[1] : null;

    if (!code) {
      throw new Error('No authorization code found in redirect');
    }

    // Send to Backend
    // 'redirect_uri' sent to backend must match the one sent to GitHub (the Proxy)

    console.warn('Sending code to backend for token exchange...');
    const res = await api.post('/auth/mobile/github', {
      code: code,
      redirect_uri: PROXY_URL,
    });
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
