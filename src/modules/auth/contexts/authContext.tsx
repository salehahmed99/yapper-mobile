import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { deleteToken, getToken, saveToken } from '../../../storage/secureStorage';
import { IUser } from '../../../types/user';
import { login } from '../services/authService';
import { LoginCredentials } from '../types';

interface AuthContextType {
  user: IUser | null;
  token: string | null;
  loading: boolean;
  loginUser: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<IUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const savedToken = await getToken();
      if (savedToken) setToken(savedToken);
      setLoading(false);
    };
    loadToken();
  }, []);

  const loginUser = useCallback(async (credentials: LoginCredentials) => {
    try {
      const res = await login(credentials);
      setUser(res?.data?.user || null);
      const accessToken = res?.data?.access_token;
      if (!accessToken) {
        throw new Error('No access token received from server.');
      }
      setToken(accessToken);
      await saveToken(accessToken);
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    await deleteToken();
    setUser(null);
    setToken(null);
  }, []);

  const contextValue = useMemo<AuthContextType>(
    () => ({ user, token, loading, loginUser, logout }),
    [user, token, loading, loginUser, logout]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};
