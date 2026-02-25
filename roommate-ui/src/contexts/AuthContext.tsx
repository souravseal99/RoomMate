import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { login as apiLogin, register as apiRegister, logout as apiLogout, refreshSession as apiRefresh, getSessionId } from '../api/auth';

interface User {
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_ID_KEY = 'roommate_session_id';
const USER_KEY = 'roommate_user';

function getStoredSessionId(): string {
  let sessionId = localStorage.getItem(SESSION_ID_KEY);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(SESSION_ID_KEY, sessionId);
  }
  return sessionId;
}

function getStoredUser(): User | null {
  const userStr = localStorage.getItem(USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const storedUser = getStoredUser();
      if (storedUser) {
        setUser(storedUser);
        try {
          const sessionId = getStoredSessionId();
          const response = await apiRefresh(sessionId);
          if (response.data?.accessToken) {
            setAccessToken(response.data.accessToken);
          }
        } catch (error) {
          // Session expired, clear state
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(SESSION_ID_KEY);
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const sessionId = getStoredSessionId();
    const response = await apiLogin(email, password, sessionId);
    
    if (response.data?.user) {
      setUser(response.data.user);
      setAccessToken(response.data.accessToken || null);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    } else {
      throw new Error(response.message || 'Login failed');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const sessionId = getStoredSessionId();
    const response = await apiRegister(name, email, password, sessionId);
    
    if (response.data?.user) {
      setUser(response.data.user);
      setAccessToken(response.data.accessToken || null);
      localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    } else {
      throw new Error(response.message || 'Registration failed');
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem(SESSION_ID_KEY);
      if (sessionId) {
        await apiLogout(sessionId);
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      setUser(null);
      setAccessToken(null);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(SESSION_ID_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
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
