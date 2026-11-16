import axios from 'axios';
import { SERVER_BASE_URL } from '@/api/config';
import TokenStore from '@/lib/TokenStore';

const api = axios.create({
  baseURL: SERVER_BASE_URL,
  withCredentials: true,
  timeout: 60000, // Increased to 60s for Render cold starts
});

// Attach access token, session ID, and CSRF token
api.interceptors.request.use(async (config) => {
  const accessToken = TokenStore.getToken();

  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  config.headers['X-Session-Id'] = TokenStore.getSessionId();

  // Attach CSRF token on mutating requests (POST, PUT, PATCH, DELETE), excluding public auth routes
  const method = config.method?.toUpperCase();
  const isPublicAuthRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/register') ||
    config.url?.includes('/auth/csrf-token');

  if (method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && !isPublicAuthRoute) {
    let csrfToken = TokenStore.getCsrfToken();
    if (!csrfToken) {
      try {
        const res = await axios.get(`${SERVER_BASE_URL}/auth/csrf-token`, {
          withCredentials: true,
          headers: {
            'X-Session-Id': TokenStore.getSessionId(),
          },
        });
        csrfToken = res.data?.csrfToken;
        if (csrfToken) {
          TokenStore.setCsrfToken(csrfToken);
        }
      } catch (err) {
        console.warn('Failed to pre-fetch CSRF token:', err);
      }
    }

    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }

  return config;
});

// Dedicated client for auth rotation/refresh to prevent recursive interceptor loops
const authClient = axios.create({
  baseURL: SERVER_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Retry once on invalid or expired CSRF token
    if (
      error.response?.status === 403 &&
      (error.response?.data?.code === 'EBADCSRFTOKEN' ||
        error.response?.data?.errorMessage?.toLowerCase().includes('csrf')) &&
      !originalRequest._csrfRetry
    ) {
      originalRequest._csrfRetry = true;
      try {
        const res = await axios.get(`${SERVER_BASE_URL}/auth/csrf-token`, {
          withCredentials: true,
          headers: {
            'X-Session-Id': TokenStore.getSessionId(),
          },
        });
        const newCsrf = res.data?.csrfToken;
        if (newCsrf) {
          TokenStore.setCsrfToken(newCsrf);
          originalRequest.headers['X-Session-Id'] = TokenStore.getSessionId();
          originalRequest.headers['X-CSRF-Token'] = newCsrf;
          return api(originalRequest);
        }
      } catch (csrfErr) {
        return Promise.reject(csrfErr);
      }
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Refresh is already in progress: queue this request until it finishes
        return new Promise<any>((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              originalRequest.headers['X-Session-Id'] = TokenStore.getSessionId();
              resolve(api(originalRequest));
            },
            reject: (err: any) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { accessToken } = await refreshSession();
        processQueue(null, accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        originalRequest.headers['X-Session-Id'] = TokenStore.getSessionId();

        return api(originalRequest);
      } catch (e) {
        processQueue(e, null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

let refreshPromise: Promise<{
  accessToken: string;
  email: string | null;
  name: string | null;
  userId?: string | null;
}> | null = null;

export const broadcastAuthEvent = (event: any) => {
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      const channel = new BroadcastChannel('roommate_auth_channel');
      channel.postMessage(event);
      channel.close();
    } catch {
      // Ignore
    }
  }
};

export const refreshSession = async (): Promise<{
  accessToken: string;
  email: string | null;
  name: string | null;
  userId?: string | null;
}> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const sessionId = TokenStore.getSessionId();

  refreshPromise = (async () => {
    try {
      const res = await authClient.get('/auth/refresh', {
        headers: {
          'X-Session-Id': sessionId,
        },
      });
      const authData = res?.data?.data ?? res?.data;
      const accessToken = authData?.accessToken;
      const email = authData?.email ?? null;
      const name = authData?.name ?? null;
      const userId = authData?.userId ?? null;

      if (!accessToken) {
        throw new Error('Refresh token response missing access token');
      }

      TokenStore.setAuthInfo({ accessToken, email, name, userId });
      broadcastAuthEvent({
        type: 'TOKEN_REFRESHED',
        accessToken,
        email,
        name,
        userId,
      });

      return { accessToken, email, name, userId };
    } catch (err) {
      TokenStore.setAuthInfo({ accessToken: null });
      throw err;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

export default class Api {
  static async initCsrfToken(): Promise<string | null> {
    try {
      const res = await api.get('/auth/csrf-token');
      const token = res.data?.csrfToken;
      if (token) TokenStore.setCsrfToken(token);
      return token;
    } catch {
      return null;
    }
  }

  static async get<T = any>(route: string, config?: any): Promise<T> {
    return (await api.get(route, config)).data;
  }

  static async post<T = any>(route: string, data?: any): Promise<T> {
    return (await api.post(route, data)).data;
  }

  static async put<T = any>(route: string, data?: any): Promise<T> {
    return (await api.put(route, data)).data;
  }

  static async patch<T = any>(route: string, data?: any): Promise<T> {
    return (await api.patch(route, data)).data;
  }

  static async delete<T = any>(route: string): Promise<T> {
    return (await api.delete(route)).data;
  }
}
