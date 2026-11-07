import { nanoid } from 'nanoid';

export interface AuthInfo {
  accessToken: string | null;
  email?: string | null;
  name?: string | null;
  userId?: string | null;
}

type TokenListener = (authInfo: AuthInfo) => void;

export default class TokenStore {
  private static accessToken: string | null = null;
  private static csrfToken: string | null = null;
  private static readonly SESSION_KEY = 'roommate_session_id';
  private static listeners: Set<TokenListener> = new Set();

  static getToken() {
    return this.accessToken;
  }

  static setToken(token: string | null) {
    this.accessToken = token ? token : null;
    this.notify({ accessToken: this.accessToken });
  }

  static setAuthInfo(info: AuthInfo) {
    this.accessToken = info.accessToken ? info.accessToken : null;
    this.notify(info);
  }

  static subscribe(listener: TokenListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private static notify(info: AuthInfo) {
    this.listeners.forEach((listener) => {
      try {
        listener(info);
      } catch (err) {
        console.error('Error in TokenStore listener:', err);
      }
    });
  }

  static getCsrfToken(): string | null {
    return this.csrfToken;
  }

  static setCsrfToken(token: string | null) {
    this.csrfToken = token ? token : null;
  }

  static getSessionId(): string {
    const existingSessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (existingSessionId) {
      return existingSessionId;
    }
    const newSessionId = nanoid();
    sessionStorage.setItem(this.SESSION_KEY, newSessionId);
    return newSessionId;
  }

  static hasSession(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) !== null;
  }

  static clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.accessToken = null;
    this.csrfToken = null;
    this.notify({ accessToken: null, email: null, name: null, userId: null });
  }
}
