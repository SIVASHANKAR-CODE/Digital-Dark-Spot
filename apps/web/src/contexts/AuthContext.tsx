import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile } from '@/types';
import {
  loginWithGoogle as apiLoginWithGoogle,
  loginWithEmail as apiLoginWithEmail,
  registerWithEmail as apiRegisterWithEmail,
  getCurrentUser as apiGetCurrentUser,
} from '../lib/api';

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGoogle: (idToken: string) => Promise<UserProfile>;
  loginWithEmail: (email: string, password: string) => Promise<UserProfile>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<UserProfile>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_USER_KEY = 'dds_auth_user';
const AUTH_TOKEN_KEY = 'dds_auth_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore authenticated session from localStorage
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const storedUser = localStorage.getItem(AUTH_USER_KEY);
        const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);

        if (storedToken && storedUser) {
          const parsedUser: UserProfile = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Verify token validity against backend session endpoint
          try {
            const verified = await apiGetCurrentUser();
            setUser(verified);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(verified));
          } catch (err: any) {
            // If the server rejected token with 401 Unauthorized, clean session
            if (err?.status === 401) {
              localStorage.removeItem(AUTH_USER_KEY);
              localStorage.removeItem(AUTH_TOKEN_KEY);
              setUser(null);
              setToken(null);
            }
          }
        }
      } catch {
        localStorage.removeItem(AUTH_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const setAuthSession = (userProfile: UserProfile, authToken: string) => {
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(userProfile));
    localStorage.setItem(AUTH_TOKEN_KEY, authToken);
    setUser(userProfile);
    setToken(authToken);
  };

  const loginWithGoogle = async (idToken: string): Promise<UserProfile> => {
    const data = await apiLoginWithGoogle(idToken);
    setAuthSession(data.user, data.token);
    return data.user;
  };

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    const data = await apiLoginWithEmail(email, password);
    setAuthSession(data.user, data.token);
    return data.user;
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<UserProfile> => {
    const data = await apiRegisterWithEmail(name, email, password);
    setAuthSession(data.user, data.token);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
