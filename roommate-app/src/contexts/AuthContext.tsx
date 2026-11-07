import TokenStore from '@/lib/TokenStore';
import { logoutUser, refreshSession } from '@/api/authApi';
import { broadcastAuthEvent } from '@/api/axios';
import { getTokenExpTimestampMs } from '@/utils/jwt';
import { createContext, type ReactNode, useEffect, useMemo, useState } from 'react';

type AuthContextType = {
  isAuthenticated: boolean;
  accessToken: string | null;
  setAccessToken?: (token: string | null) => void;
  email: string | null;
  name: string | null;
  login: (token: string, email?: string | null, name?: string | null) => void;
  logout: () => void;
  ready: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initial session check on mount
  useEffect(() => {
    const tryRefresh = async () => {
      try {
        setReady(false);

        // Only try refresh if session exists
        if (!TokenStore.hasSession()) {
          setReady(true);
          return;
        }

        const { accessToken, email, name } = await refreshSession();

        if (accessToken) {
          setAccessToken(accessToken);
          setIsAuthenticated(true);
          if (email) setEmail(email);
          if (name) setName(name);
        } else {
          setIsAuthenticated(false);
          setEmail(null);
          setName(null);
          TokenStore.setToken(null);
        }
      } catch (_e) {
        setIsAuthenticated(false);
        setEmail(null);
        setName(null);
        TokenStore.setToken(null);
      }
      setReady(true);
    };

    tryRefresh();
  }, []);

  // Synchronize state with TokenStore updates (e.g. from axios 401 retry interceptor)
  useEffect(() => {
    const unsubscribe = TokenStore.subscribe((info) => {
      if (info.accessToken) {
        setAccessToken(info.accessToken);
        setIsAuthenticated(true);
        if (info.email !== undefined) setEmail(info.email);
        if (info.name !== undefined) setName(info.name);
      } else if (info.accessToken === null && !TokenStore.hasSession()) {
        setAccessToken(null);
        setIsAuthenticated(false);
        setEmail(null);
        setName(null);
      }
    });

    return unsubscribe;
  }, []);

  // Proactive Silent Refresh: schedules token refresh 2 minutes before JWT expiration
  useEffect(() => {
    if (!accessToken) return;

    const expMs = getTokenExpTimestampMs(accessToken);
    if (!expMs) return;

    const timeUntilExpiry = expMs - Date.now();
    // Schedule refresh 2 minutes (120s) before expiry, with a minimum 5s floor
    const refreshBufferMs = 2 * 60 * 1000;
    const delay = Math.max(timeUntilExpiry - refreshBufferMs, 5000);

    const timer = setTimeout(async () => {
      try {
        await refreshSession();
      } catch (err) {
        console.warn('[Auth] Proactive token refresh failed:', err);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [accessToken]);

  // Tab wake-up / refocus listener: catch up immediately if system slept or idle past expiry
  useEffect(() => {
    const handleWakeup = async () => {
      if (document.visibilityState === 'visible' && TokenStore.hasSession()) {
        const currentToken = TokenStore.getToken();
        if (currentToken) {
          const expMs = getTokenExpTimestampMs(currentToken);
          // If token expires in less than 90 seconds (or is expired), refresh immediately
          if (expMs && expMs - Date.now() < 90 * 1000) {
            try {
              await refreshSession();
            } catch (err) {
              console.warn('[Auth] Wakeup refresh failed:', err);
            }
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleWakeup);
    window.addEventListener('focus', handleWakeup);

    return () => {
      document.removeEventListener('visibilitychange', handleWakeup);
      window.removeEventListener('focus', handleWakeup);
    };
  }, []);

  // Cross-tab synchronization via BroadcastChannel
  useEffect(() => {
    if (typeof BroadcastChannel === 'undefined') return;

    const channel = new BroadcastChannel('roommate_auth_channel');
    channel.onmessage = (event) => {
      if (event.data?.type === 'TOKEN_REFRESHED') {
        const { accessToken, email, name, userId } = event.data;
        TokenStore.setAuthInfo({ accessToken, email, name, userId });
        setAccessToken(accessToken);
        setIsAuthenticated(true);
        if (email) setEmail(email);
        if (name) setName(name);
      } else if (event.data?.type === 'SESSION_LOGOUT') {
        TokenStore.clearSession();
        setAccessToken(null);
        setIsAuthenticated(false);
        setEmail(null);
        setName(null);
      }
    };

    return () => {
      channel.close();
    };
  }, []);

  const login = (token: string, email?: string | null, name?: string | null) => {
    setAccessToken(token);
    setIsAuthenticated(true);
    if (email !== undefined) setEmail(email);
    if (name !== undefined) setName(name);
    TokenStore.setAuthInfo({ accessToken: token, email, name });
    broadcastAuthEvent({
      type: 'TOKEN_REFRESHED',
      accessToken: token,
      email,
      name,
    });
  };

  // Logout - calls API, broadcasts to other tabs, and clears local state
  const logout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      broadcastAuthEvent({ type: 'SESSION_LOGOUT' });
      TokenStore.clearSession();
      setAccessToken(null);
      setEmail(null);
      setName(null);
      setIsAuthenticated(false);
    }
  };

  const providerValues = useMemo(
    () =>
      ({
        isAuthenticated,
        accessToken,
        setAccessToken,
        email,
        name,
        login,
        logout,
        ready,
      }) as AuthContextType,
    [isAuthenticated, accessToken, email, name, ready, login, logout, setAccessToken]
  );

  return <AuthContext.Provider value={providerValues}>{children}</AuthContext.Provider>;
}
