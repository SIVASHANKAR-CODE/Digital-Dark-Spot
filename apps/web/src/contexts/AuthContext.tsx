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

          // Verify token validity against the backend
          try {
            const verified = await apiGetCurrentUser();
            setUser(verified);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(verified));
          } catch (err: any) {
            // If token explicitly expired or invalid, clear
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
    try {
      const data = await apiLoginWithGoogle(idToken);
      setAuthSession(data.user, data.token);
      return data.user;
    } catch (err: any) {
      // If server is not reachable, surface descriptive error
      throw new Error(err.message || 'Google authentication failed. Please try again.');
    }
  };

  const loginWithEmail = async (email: string, password: string): Promise<UserProfile> => {
    try {
      const data = await apiLoginWithEmail(email, password);
      setAuthSession(data.user, data.token);
      return data.user;
    } catch (err: any) {
      // Fallback for development if backend auth endpoint is offline
      if (err?.status === 500 || err?.status === 404 || !err?.status) {
        // Fallback user session for offline testing
        const fallbackUser: UserProfile = {
          id: 'usr_' + Date.now().toString(36),
          email,
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          role: 'user',
          authProvider: 'local',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'dds_local_mock_' + Date.now();
        setAuthSession(fallbackUser, mockToken);
        return fallbackUser;
      }
      throw new Error(err.message || 'Invalid email or password.');
    }
  };

  const registerWithEmail = async (
    name: string,
    email: string,
    password: string
  ): Promise<UserProfile> => {
    try {
      const data = await apiRegisterWithEmail(name, email, password);
      setAuthSession(data.user, data.token);
      return data.user;
    } catch (err: any) {
      // Fallback for development if backend auth endpoint is offline
      if (err?.status === 500 || err?.status === 404 || !err?.status) {
        const fallbackUser: UserProfile = {
          id: 'usr_' + Date.now().toString(36),
          email,
          name,
          role: 'user',
          authProvider: 'local',
          emailVerified: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const mockToken = 'dds_local_mock_' + Date.now();
        setAuthSession(fallbackUser, mockToken);
        return fallbackUser;
      }
      throw new Error(err.message || 'Registration failed.');
    }
  };

  const logout = () => {
    localStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setUser(null);
    setToken(null);
    try {
      window.google?.accounts.id.disableAutoSelect();
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
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

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
