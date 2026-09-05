import { nanoid } from 'nanoid';

export default class TokenStore {
  private static accessToken: string | null = null;
  private static readonly SESSION_KEY = 'roommate_session_id';

  static getToken() {
    return this.accessToken;
  }

  static setToken(token: string | null) {
    this.accessToken = token ? token : null;
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
  }
}
