import axios from "axios";
import { SERVER_BASE_URL } from "@/api/config";
import TokenStore from "@/lib/TokenStore";

const api = axios.create({
  baseURL: SERVER_BASE_URL,
  withCredentials: true,
  timeout: 10000,
});

// Attach access token and session ID
api.interceptors.request.use((config) => {
  const accessToken = TokenStore.getToken();
  
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  if (TokenStore.hasSession()) {
    config.headers['X-Session-Id'] = TokenStore.getSessionId();
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("Trying to auto-refresh token... ", error.response?.status);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        const res = await Api.get("/auth/refresh");
        TokenStore.setToken(res.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
        originalRequest.headers['X-Session-Id'] = TokenStore.getSessionId();

        return api(originalRequest);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    return Promise.reject(error);
  }
);

export default class Api {
  static async get(route: string) {
    return (await api.get(route)).data;
  }

  static async post(route: string, data: any) {
    return (await api.post(route, data)).data;
  }

  static async put(route: string, data: any) {
    return (await api.put(route, data)).data;
  }

  static async patch(route: string, data: any) {
    return (await api.patch(route, data)).data;
  }

  static async delete(route: string) {
    return (await api.delete(route)).data;
  }
}
