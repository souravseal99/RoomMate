import { doubleCsrf } from "csrf-csrf";
import { Request } from "express";
import { CSRF_SECRET, USE_SECURE_COOKIE } from "@src/common/config";

const isProduction = process.env.NODE_ENV === "production";

export const {
  invalidCsrfTokenError,
  generateCsrfToken,
  validateRequest,
  doubleCsrfProtection,
} = doubleCsrf({
  getSecret: () => CSRF_SECRET,
  getSessionIdentifier: (req: Request) =>
    (req.headers["x-session-id"] as string) || "",
  cookieName: "x-csrf-token",
  cookieOptions: {
    sameSite: isProduction || USE_SECURE_COOKIE ? "none" : "lax",
    path: "/",
    secure: isProduction || USE_SECURE_COOKIE,
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
    const publicPaths = new Set([
      "/auth/login",
      "/auth/register",
      "/auth/csrf-token",
      "/health",
      "/dev/seed",
    ]);
    const cleanPath = (req.path || "").split("?")[0].replace(/\/+$/, "") || "/";
    const cleanOriginalUrl =
      (req.originalUrl || "").split("?")[0].replace(/\/+$/, "") || "/";
    return publicPaths.has(cleanPath) || publicPaths.has(cleanOriginalUrl);
  },
});
