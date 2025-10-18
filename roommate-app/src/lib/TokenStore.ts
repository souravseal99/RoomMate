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
    let sessionId = sessionStorage.getItem(this.SESSION_KEY);
    if (!sessionId) {
      sessionId = nanoid();
      sessionStorage.setItem(this.SESSION_KEY, sessionId);
    }
    return sessionId;
  }

  static hasSession(): boolean {
    return sessionStorage.getItem(this.SESSION_KEY) !== null;
  }

  static clearSession() {
    sessionStorage.removeItem(this.SESSION_KEY);
    this.accessToken = null;
  }
}
