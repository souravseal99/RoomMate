import { CookieOptions, Response } from "express";

const isProduction = process.env.NODE_ENV === "production";
const useSecureCookie = process.env.USE_SECURE_COOKIE === "true";

export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";

export const getRefreshTokenCookieOptions = (): CookieOptions => ({
  httpOnly: true,
  secure: isProduction || useSecureCookie,
  sameSite: isProduction || useSecureCookie ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  path: "/",
});

export const refreshTokenSetter = (
  response: Response,
  refreshToken: string,
) => {
  response.cookie(
    REFRESH_TOKEN_COOKIE_NAME,
    refreshToken,
    getRefreshTokenCookieOptions(),
  );
};

export const clearRefreshTokenCookie = (response: Response) => {
  const { maxAge: _maxAge, ...clearOptions } = getRefreshTokenCookieOptions();
  response.clearCookie(REFRESH_TOKEN_COOKIE_NAME, clearOptions);
};

export default refreshTokenSetter;
