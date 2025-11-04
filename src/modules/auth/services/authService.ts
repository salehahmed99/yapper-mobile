import { extractErrorMessage } from '@/src/utils/errorExtraction';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
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
  mapLoginResponseDTOToLoginResponse,
  mapOAuthResponseDTOToOAuthResponse,
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
    return mapLoginResponseDTOToLoginResponse(res.data);
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

    await api.post('/auth/logout');
    await setAuthProvider(null);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/* -------------------------------------------------------------------------- */
/*                               Google Sign-In                               */
/* -------------------------------------------------------------------------- */

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID!,
  iosClientId: process.env.EXPO_PUBLIC_IOS_ID,
  offlineAccess: true,
  forceCodeForRefreshToken: true,
});

export const googleSignIn = async (): Promise<ILoginResponse | IOAuthResponse> => {
  try {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    await googleSignOut();
    const userInfo = await GoogleSignin.signIn();

    const { idToken } = userInfo.data || {};
    if (!idToken) throw new Error('Failed to get idToken from Google');

    const res = await api.post('/auth/mobile/google', {
      access_token: idToken,
    });
    await setAuthProvider('google');

    if (res.data.data.needs_completion) {
      return mapOAuthResponseDTOToOAuthResponse(res.data);
    }
    return mapLoginResponseDTOToLoginResponse(res.data);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const googleSignOut = async (): Promise<void> => {
  try {
    await GoogleSignin.signOut();
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

/* -------------------------------------------------------------------------- */
/*                               GitHub Sign-In                               */
/* -------------------------------------------------------------------------- */

const GITHUB_CLIENT_ID = process.env.EXPO_PUBLIC_GITHUB_CLIENT_ID!;

const discovery = {
  authorizationEndpoint: 'https://github.com/login/oauth/authorize',
  tokenEndpoint: 'https://github.com/login/oauth/access_token',
};

export const githubSignIn = async (): Promise<ILoginResponse | IOAuthResponse> => {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'yappermobile',
      path: 'redirect',
    });

    const request = new AuthSession.AuthRequest({
      clientId: GITHUB_CLIENT_ID,
      scopes: ['read:user', 'user:email'],
      redirectUri,
      usePKCE: true,
    });

    const result = await request.promptAsync(discovery);
    const codeVerifier = request.codeVerifier;

    if (result.type !== 'success' || !result.params.code) {
      throw new Error('GitHub sign-in failed or cancelled');
    }

    const res = await api.post('/auth/mobile/github', {
      code: result.params.code,
      redirect_uri: redirectUri,
      code_verifier: codeVerifier,
    });

    await setAuthProvider('github');
    if (res.data.data.needs_completion) {
      return mapOAuthResponseDTOToOAuthResponse(res.data);
    }
    return mapLoginResponseDTOToLoginResponse(res.data);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const OAuthStep1 = async (credentials: IOAuthBirthDateRequest): Promise<IOAuthBirthDateResponse> => {
  try {
    const res = await api.post('/auth/oauth/complete/step1', {
      oauth_session_token: credentials.oauth_session_token,
      birth_date: credentials.birth_date,
    });
    return res.data;
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};

export const OAuthStep2 = async (credentials: IOAuthUserNameRequest): Promise<ILoginResponse> => {
  try {
    const res = await api.post('/auth/oauth/complete/step2', {
      oauth_session_token: credentials.oauth_session_token,
      username: credentials.username,
    });
    return mapLoginResponseDTOToLoginResponse(res.data);
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }
};
