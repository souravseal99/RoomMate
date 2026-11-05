import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AuthController } from "@src/auth/auth.controller";
import { SessionRepo } from "@src/auth/session.repo";
import { UserRepo } from "@src/users/user.repo";
import { generateTokens, validateRefreshToken } from "@common/utils/jwtHandler";
import { REFRESH_TOKEN_COOKIE_NAME } from "@src/auth/refreshTokenSetter";

vi.mock("@src/common/utils/prisma", () => ({
  default: {},
}));
vi.mock("@src/auth/session.repo");
vi.mock("@src/users/user.repo");
vi.mock("@common/utils/jwtHandler");

describe("Auth Integration Tests (VULN-04 & VULN-07 Remediation)", () => {
  let res: Partial<Response>;
  let statusCode = 200;
  let responseData: any = null;
  let setCookies: Record<string, { value: string; options: any }> = {};
  let clearedCookies: Record<string, any> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    statusCode = 200;
    responseData = null;
    setCookies = {};
    clearedCookies = {};

    res = {
      status: vi.fn().mockImplementation((code: number) => {
        statusCode = code;
        return res;
      }),
      json: vi.fn().mockImplementation((data: any) => {
        responseData = data;
        return res;
      }),
      cookie: vi
        .fn()
        .mockImplementation((name: string, value: string, options: any) => {
          setCookies[name] = { value, options };
          return res;
        }),
      clearCookie: vi.fn().mockImplementation((name: string, options: any) => {
        clearedCookies[name] = options;
        return res;
      }),
    };
  });

  describe("GET /auth/refresh", () => {
    it("should reject refresh with 400 when X-Session-Id header is missing", async () => {
      const req = {
        headers: {},
        cookies: { [REFRESH_TOKEN_COOKIE_NAME]: "some_token" },
      } as unknown as Request;

      await AuthController.refresh(req, res as Response);

      expect(statusCode).toBe(StatusCodes.BAD_REQUEST);
      expect(responseData.message).toMatch(/session id required/i);
    });

    it("should reject refresh with 401 when refreshToken cookie is missing (VULN-04 defense)", async () => {
      const req = {
        headers: { "x-session-id": "session-123" },
        cookies: {},
      } as unknown as Request;

      await AuthController.refresh(req, res as Response);

      expect(statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(responseData.message).toMatch(/refresh token cookie missing/i);
    });

    it("should reject refresh with 401 when presented cookie token fails signature verification (VULN-07)", async () => {
      vi.mocked(validateRefreshToken).mockResolvedValue(null as any);

      const req = {
        headers: { "x-session-id": "session-123" },
        cookies: { [REFRESH_TOKEN_COOKIE_NAME]: "forged_expired_token" },
      } as unknown as Request;

      await AuthController.refresh(req, res as Response);

      expect(statusCode).toBe(StatusCodes.UNAUTHORIZED);
      expect(responseData.message).toMatch(/refresh token invalid/i);
    });

    it("should successfully rotate refresh token cookie and return new accessToken in body", async () => {
      const validCookieToken = "valid_old_cookie_token";
      const rotatedRefreshToken = "rotated_new_refresh_token";
      const newAccessToken = "new_access_token_123";

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-1" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue({
        sessionId: "session-123",
        userId: "user-1",
        refreshToken: validCookieToken,
        expiresAt: new Date(Date.now() + 100000),
      } as any);
      vi.mocked(UserRepo.getUserById).mockResolvedValue({
        userId: "user-1",
        name: "Test User",
        email: "test@example.com",
      } as any);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: newAccessToken,
        refreshToken: rotatedRefreshToken,
      });
      vi.mocked(SessionRepo.updateSession).mockResolvedValue({} as any);

      const req = {
        headers: { "x-session-id": "session-123" },
        cookies: { [REFRESH_TOKEN_COOKIE_NAME]: validCookieToken },
      } as unknown as Request;

      await AuthController.refresh(req, res as Response);

      expect(statusCode).toBe(StatusCodes.OK);
      expect(responseData.data.accessToken).toBe(newAccessToken);
      // Verify refresh token is NEVER exposed in the JSON response payload
      expect(responseData.data.refreshToken).toBeUndefined();

      // Verify new refresh token was set as an httpOnly cookie
      expect(setCookies[REFRESH_TOKEN_COOKIE_NAME]).toBeDefined();
      expect(setCookies[REFRESH_TOKEN_COOKIE_NAME].value).toBe(
        rotatedRefreshToken,
      );
      expect(setCookies[REFRESH_TOKEN_COOKIE_NAME].options.httpOnly).toBe(true);
    });
  });

  describe("GET /auth/logout", () => {
    it("should delete session and clear refreshToken cookie", async () => {
      vi.mocked(SessionRepo.deleteSession).mockResolvedValue({} as any);

      const req = {
        headers: { "x-session-id": "session-123" },
      } as unknown as Request;

      await AuthController.logout(req, res as Response);

      expect(statusCode).toBe(StatusCodes.OK);
      expect(clearedCookies[REFRESH_TOKEN_COOKIE_NAME]).toBeDefined();
      expect(clearedCookies[REFRESH_TOKEN_COOKIE_NAME].httpOnly).toBe(true);
      expect(SessionRepo.deleteSession).toHaveBeenCalledWith("session-123");
    });
  });
});
