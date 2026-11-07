import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthService } from "@src/auth/auth.service";
import { UserRepo } from "@src/users/user.repo";
import { SessionRepo } from "@src/auth/session.repo";
import bcrypt from "bcrypt";
import {
  generateTokens,
  getNewAccessToken,
  validateRefreshToken,
} from "@common/utils/jwtHandler";
import { User } from "@generated/prisma";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/users/user.repo");
vi.mock("@src/auth/session.repo");
vi.mock("bcrypt");
vi.mock("@common/utils/jwtHandler");

vi.mock("@common/config", () => ({
  BCRYPT_SALT_ROUNDS: 10,
  JWT_REFRESH_EXPIRES_IN: "7d",
}));

describe("AuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should successfully register new user with hashed password and session", async () => {
      const mockUser: User = {
        userId: "user-123",
        name: "Alice Smith",
        email: "alice@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      vi.mocked(UserRepo.createUser).mockResolvedValue(mockUser);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "access_token_123",
        refreshToken: "refresh_token_123",
      });
      vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);

      const result = await AuthService.registerUser(
        "Alice Smith",
        "alice@example.com",
        "password123",
        "session-123",
      );

      expect(UserRepo.getUserByEmail).toHaveBeenCalledWith("alice@example.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
      expect(UserRepo.createUser).toHaveBeenCalledWith(
        "Alice Smith",
        "alice@example.com",
        "hashed_password",
      );
      expect(generateTokens).toHaveBeenCalledWith({ userId: "user-123" });
      expect(SessionRepo.createSession).toHaveBeenCalledWith(
        "session-123",
        "user-123",
        "refresh_token_123",
        expect.any(Date),
      );
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "User successfully created",
        data: {
          name: "Alice Smith",
          email: "alice@example.com",
          accessToken: "access_token_123",
        },
      });
    });

    it("should reject registration when email already exists", async () => {
      const existingUser: User = {
        userId: "user-456",
        name: "Existing User",
        email: "existing@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(existingUser);

      const result = await AuthService.registerUser(
        "New User",
        "existing@example.com",
        "password123",
        "session-456",
      );

      expect(UserRepo.getUserByEmail).toHaveBeenCalledWith(
        "existing@example.com",
      );
      expect(UserRepo.createUser).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.CONFLICT,
        message: "Email already registered",
      });
    });

    it("should hash password with correct salt rounds", async () => {
      const mockUser: User = {
        userId: "user-789",
        name: "Bob",
        email: "bob@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      vi.mocked(UserRepo.createUser).mockResolvedValue(mockUser);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });
      vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);

      await AuthService.registerUser(
        "Bob",
        "bob@example.com",
        "password123",
        "session-789",
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should create session with 7-day expiration", async () => {
      const mockUser: User = {
        userId: "user-abc",
        name: "Charlie",
        email: "charlie@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      const now = Date.now();
      vi.spyOn(Date, "now").mockReturnValue(now);

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(null);
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed_password" as never);
      vi.mocked(UserRepo.createUser).mockResolvedValue(mockUser);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });
      vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);

      await AuthService.registerUser(
        "Charlie",
        "charlie@example.com",
        "password123",
        "session-abc",
      );

      const expectedExpiresAt = new Date(now + 7 * 24 * 60 * 60 * 1000);
      expect(SessionRepo.createSession).toHaveBeenCalledWith(
        "session-abc",
        "user-abc",
        "refresh_token",
        expectedExpiresAt,
      );
    });
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const mockUser: User = {
        userId: "user-123",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "access_token_123",
        refreshToken: "refresh_token_123",
      });
      vi.mocked(SessionRepo.deleteSession).mockResolvedValue({} as any);
      vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);

      const result = await AuthService.login(
        "alice@example.com",
        "password123",
        "session-123",
      );

      expect(UserRepo.getUserByEmail).toHaveBeenCalledWith("alice@example.com");
      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
      expect(generateTokens).toHaveBeenCalledWith({ userId: "user-123" });
      expect(SessionRepo.createSession).toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Welcome to Roommate Alice",
        data: {
          name: "Alice",
          email: "alice@example.com",
          accessToken: "access_token_123",
        },
      });
    });

    it("should reject login when user not found", async () => {
      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(null);

      const result = await AuthService.login(
        "notfound@example.com",
        "password123",
        "session-456",
      );

      expect(UserRepo.getUserByEmail).toHaveBeenCalledWith(
        "notfound@example.com",
      );
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "User not found",
      });
    });

    it("should reject login with incorrect password", async () => {
      const mockUser: User = {
        userId: "user-789",
        name: "Bob",
        email: "bob@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await AuthService.login(
        "bob@example.com",
        "wrong_password",
        "session-789",
      );

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "wrong_password",
        "hashed_password",
      );
      expect(generateTokens).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "Password mismatch",
      });
    });

    it("should delete existing session before creating new one", async () => {
      const mockUser: User = {
        userId: "user-abc",
        name: "Charlie",
        email: "charlie@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      vi.mocked(UserRepo.getUserByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "access_token",
        refreshToken: "refresh_token",
      });
      vi.mocked(SessionRepo.deleteSession).mockResolvedValue({} as any);
      vi.mocked(SessionRepo.createSession).mockResolvedValue({} as any);

      await AuthService.login(
        "charlie@example.com",
        "password123",
        "session-abc",
      );

      expect(SessionRepo.deleteSession).toHaveBeenCalledWith("session-abc");
      expect(SessionRepo.createSession).toHaveBeenCalledAfter(
        vi.mocked(SessionRepo.deleteSession),
      );
    });
  });

  describe("refresh", () => {
    it("should successfully refresh and rotate token with valid cookie and matching session", async () => {
      const mockUser: User = {
        userId: "user-123",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };

      const futureDate = new Date(Date.now() + 100000);
      const mockSession = {
        sessionId: "session-123",
        userId: "user-123",
        refreshToken: "valid_refresh_token",
        expiresAt: futureDate,
        createdAt: new Date(),
        user: mockUser,
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockUser);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "rotated_access_token",
        refreshToken: "rotated_refresh_token",
      });
      vi.mocked(SessionRepo.updateSession).mockResolvedValue({} as any);

      const result = await AuthService.refresh(
        "valid_refresh_token",
        "session-123",
      );

      expect(validateRefreshToken).toHaveBeenCalledWith("valid_refresh_token");
      expect(SessionRepo.getSession).toHaveBeenCalledWith("session-123");
      expect(UserRepo.getUserById).toHaveBeenCalledWith("user-123");
      expect(generateTokens).toHaveBeenCalledWith({ userId: "user-123" });
      expect(SessionRepo.updateSession).toHaveBeenCalledWith(
        "session-123",
        "rotated_refresh_token",
        expect.any(Date),
        "valid_refresh_token",
        expect.any(Date),
      );
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: {
          userId: "user-123",
          name: "Alice",
          email: "alice@example.com",
          accessToken: "rotated_access_token",
          refreshToken: "rotated_refresh_token",
        },
      });
    });

    it("should successfully refresh and return fresh access token during rotation grace period (RFC 6819)", async () => {
      const mockGraceUser: User = {
        userId: "user-123",
        name: "Alice",
        email: "alice@example.com",
        password: "hashed_password",
        createdAt: new Date("2025-11-05"),
      };
      const futureDate = new Date(Date.now() + 100000);
      const mockSession = {
        sessionId: "session-123",
        userId: "user-123",
        refreshToken: "current_active_token",
        prevRefreshToken: "recent_previous_token",
        rotatedAt: new Date(Date.now() - 5000), // rotated 5s ago (< 30s grace window)
        expiresAt: futureDate,
        createdAt: new Date(),
        user: mockGraceUser,
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(mockSession as any);
      vi.mocked(UserRepo.getUserById).mockResolvedValue(mockGraceUser);
      vi.mocked(generateTokens).mockReturnValue({
        accessToken: "grace_access_token",
        refreshToken: "ignored_token",
      });

      const result = await AuthService.refresh(
        "recent_previous_token",
        "session-123",
      );

      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: {
          userId: "user-123",
          name: "Alice",
          email: "alice@example.com",
          accessToken: "grace_access_token",
          refreshToken: "current_active_token",
        },
      });
      expect(SessionRepo.updateSession).not.toHaveBeenCalled();
    });

    it("should reject refresh when previous refresh token is presented after grace period has expired", async () => {
      const futureDate = new Date(Date.now() + 100000);
      const mockSession = {
        sessionId: "session-123",
        userId: "user-123",
        refreshToken: "current_active_token",
        prevRefreshToken: "old_previous_token",
        rotatedAt: new Date(Date.now() - 40000), // rotated 40s ago (> 30s grace window)
        expiresAt: futureDate,
        createdAt: new Date(),
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(mockSession as any);

      const result = await AuthService.refresh(
        "old_previous_token",
        "session-123",
      );

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Session mismatch or invalid token - please log in again",
      });
    });

    it("should reject refresh and return 401 when refresh token is invalid (VULN-07 fix)", async () => {
      vi.mocked(validateRefreshToken).mockResolvedValue(null as any);

      const result = await AuthService.refresh("invalid_token", "session-123");

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Refresh token invalid",
      });
      expect(SessionRepo.getSession).not.toHaveBeenCalled();
    });

    it("should reject refresh when session not found in database", async () => {
      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(null);

      const result = await AuthService.refresh(
        "valid_refresh_token",
        "session-unknown",
      );

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Invalid session",
      });
    });

    it("should reject refresh and delete session when session is expired", async () => {
      const expiredSession = {
        sessionId: "session-123",
        userId: "user-123",
        refreshToken: "valid_refresh_token",
        expiresAt: new Date(Date.now() - 5000),
        createdAt: new Date(),
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(
        expiredSession as any,
      );
      vi.mocked(SessionRepo.deleteSession).mockResolvedValue({} as any);

      const result = await AuthService.refresh(
        "valid_refresh_token",
        "session-123",
      );

      expect(SessionRepo.deleteSession).toHaveBeenCalledWith("session-123");
      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Session expired",
      });
    });

    it("should reject refresh when presented cookie token differs from database session (token theft prevention)", async () => {
      const mockSession = {
        sessionId: "session-123",
        userId: "user-123",
        refreshToken: "token_stored_in_db",
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({ userId: "user-123" });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(mockSession as any);

      const result = await AuthService.refresh(
        "different_cookie_token",
        "session-123",
      );

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Session mismatch or invalid token - please log in again",
      });
    });

    it("should reject refresh when userId in token does not match session userId", async () => {
      const mockSession = {
        sessionId: "session-123",
        userId: "user-attacker",
        refreshToken: "valid_token",
        expiresAt: new Date(Date.now() + 100000),
        createdAt: new Date(),
      };

      vi.mocked(validateRefreshToken).mockResolvedValue({
        userId: "user-victim",
      });
      vi.mocked(SessionRepo.getSession).mockResolvedValue(mockSession as any);

      const result = await AuthService.refresh("valid_token", "session-123");

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Session mismatch or invalid token - please log in again",
      });
    });

    it("should handle unexpected errors in refresh gracefully without reflecting error strings (VULN-08)", async () => {
      vi.mocked(validateRefreshToken).mockImplementation(() => {
        throw new Error("Internal crypto failure with sensitive driver trace");
      });

      const result = await AuthService.refresh("valid_token", "session-123");

      expect(result).toMatchObject({
        status: StatusCodes.UNAUTHORIZED,
        message: "Unable to refresh token",
      });
      expect((result as any).message).not.toContain("Internal crypto failure");
    });
  });

  describe("logout", () => {
    it("should delete session when sessionId is provided", async () => {
      vi.mocked(SessionRepo.deleteSession).mockResolvedValue({} as any);

      const result = await AuthService.logout("session-123");

      expect(SessionRepo.deleteSession).toHaveBeenCalledWith("session-123");
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Logged out successfully",
      });
    });

    it("should succeed gracefully when sessionId is undefined", async () => {
      const result = await AuthService.logout(undefined);

      expect(SessionRepo.deleteSession).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Logged out successfully",
      });
    });
  });
});
