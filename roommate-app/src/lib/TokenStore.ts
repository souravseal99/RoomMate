export default class TokenStore {
  private static accessToken: string | null = null;

  static getToken() {
    return this.accessToken;
  }

  static setToken(token: string | null) {
    this.accessToken = token ? token : null;
  }
}
