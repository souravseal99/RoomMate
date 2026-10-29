import { doubleCsrf } from "csrf-csrf";
import { Request } from "express";

const isProduction = process.env.NODE_ENV === "production";
const useSecureCookie = process.env.USE_SECURE_COOKIE === "true";

export const {
  invalidCsrfTokenError,
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () =>
    process.env.CSRF_SECRET ||
    process.env.JWT_SECRET ||
    "roommate_csrf_super_secret_key_2026_at_least_32_characters",
  getSessionIdentifier: (req: Request) =>
    (req.headers["x-session-id"] as string) || "",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: isProduction || useSecureCookie ? "none" : "lax",
    path: "/",
    secure: isProduction || useSecureCookie,
    httpOnly: true,
  },
  size: 32,
  ignoredMethods: ["GET", "HEAD", "OPTIONS"],
  getCsrfTokenFromRequest: (req: Request) =>
    req.headers["x-csrf-token"] as string,
  errorConfig: {
    statusCode: 403,
    message: "Invalid or missing CSRF token",
    code: "EBADCSRFTOKEN",
  },
  skipCsrfProtection: (req: Request) => {
    const publicPaths = [
      "/auth/login",
      "/auth/register",
      "/auth/csrf-token",
      "/health",
      "/dev/seed",
    ];
    const cleanPath = (req.path || "").split("?")[0];
    const cleanOriginalUrl = (req.originalUrl || "").split("?")[0];
    return publicPaths.some(
      (p) =>
        cleanPath === p ||
        cleanPath.endsWith(p) ||
        cleanOriginalUrl === p ||
        cleanOriginalUrl.endsWith(p),
    );
  },
});
