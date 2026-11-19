import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  TokenBucketStore,
  checkJoinLockout,
  recordJoinFailure,
  resetJoinFailure,
  globalLimiter,
  authAccountLimiter,
} from "@common/middlewares/rateLimiter";
import { Request, Response, NextFunction } from "express";

interface ExecutionResult {
  passed: boolean;
  statusCode: number;
  data: Record<string, unknown> | null;
}

function runLimiter(
  limiter: (req: Request, res: Response, next: NextFunction) => void,
  reqOverrides: Partial<Request> = {},
): Promise<ExecutionResult> {
  return new Promise<ExecutionResult>((resolve) => {
    const headers: Record<string, string> = {};
    let currentStatusCode = 200;

    const req: Partial<Request> = {
      path: "/test",
      method: "POST",
      headers: {},
      body: {},
      ip: "127.0.0.1",
      socket: { remoteAddress: "127.0.0.1" } as unknown as Request["socket"],
      app: {
        get: (setting: string) =>
          setting === "trust proxy" ? false : undefined,
      } as unknown as Request["app"],
      ...reqOverrides,
    };

    const res: Partial<Response> = {
      headersSent: false,
      writableEnded: false,
      statusCode: 200,
      setHeader: vi.fn(
        (key: string, val: string | number | readonly string[]) => {
          headers[key.toLowerCase()] = String(val);
          return res as Response;
        },
      ),
      getHeader: vi.fn((key: string) => headers[key.toLowerCase()]),
      hasHeader: vi.fn((key: string) => key.toLowerCase() in headers),
      status: vi.fn((code: number) => {
        currentStatusCode = code;
        res.statusCode = code;
        return res as Response;
      }),
      json: vi.fn((payload: Record<string, unknown>) => {
        resolve({
          passed: false,
          statusCode: currentStatusCode,
          data: payload,
        });
        return res as Response;
      }),
      send: vi.fn((payload: unknown) => {
        resolve({
          passed: false,
          statusCode: currentStatusCode,
          data: payload as Record<string, unknown>,
        });
        return res as Response;
      }),
    };

    limiter(req as Request, res as Response, () => {
      resolve({
        passed: true,
        statusCode: currentStatusCode,
        data: null,
      });
    });
  });
}

describe("Rate Limiter & Invite Protection Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("TokenBucketStore (Local & Fallback behavior)", () => {
    it("should allow consumption within capacity and report accurate totalHits", async () => {
      const store = new TokenBucketStore({
        capacity: 3,
        windowMs: 60 * 1000,
        prefix: "test:tb:allow:",
      });

      // Hit 1
      const hit1 = await store.increment("client1");
      expect(hit1.totalHits).toBe(1);
      expect(hit1.resetTime).toBeInstanceOf(Date);

      // Hit 2
      const hit2 = await store.increment("client1");
      expect(hit2.totalHits).toBe(2);

      // Hit 3
      const hit3 = await store.increment("client1");
      expect(hit3.totalHits).toBe(3);

      // Hit 4: Exceeds capacity!
      const hit4 = await store.increment("client1");
      expect(hit4.totalHits).toBe(4); // 4 > capacity of 3
    });

    it("should isolate separate keys independently", async () => {
      const store = new TokenBucketStore({
        capacity: 2,
        windowMs: 60 * 1000,
        prefix: "test:tb:iso:",
      });

      await store.increment("userA");
      await store.increment("userA");
      const userAOver = await store.increment("userA");
      expect(userAOver.totalHits).toBe(3); // exceeded

      // userB should still have full quota
      const userBHit1 = await store.increment("userB");
      expect(userBHit1.totalHits).toBe(1);
    });

    it("should allow key reset", async () => {
      const store = new TokenBucketStore({
        capacity: 1,
        windowMs: 60 * 1000,
        prefix: "test:tb:reset:",
      });

      await store.increment("resettable");
      const exceeded = await store.increment("resettable");
      expect(exceeded.totalHits).toBe(2);

      await store.resetKey("resettable");

      const afterReset = await store.increment("resettable");
      expect(afterReset.totalHits).toBe(1);
    });
  });

  describe("Join Lockout Mechanism (Anti-Brute Force)", () => {
    const testUserId = "user-brute-force-test";

    beforeEach(async () => {
      await resetJoinFailure(testUserId);
    });

    it("should track failed attempts and lock out user after 5 consecutive failures", async () => {
      // 1st failure
      const f1 = await recordJoinFailure(testUserId);
      expect(f1.isLocked).toBe(false);
      expect(f1.remainingAttempts).toBe(4);

      // 2nd failure
      const f2 = await recordJoinFailure(testUserId);
      expect(f2.isLocked).toBe(false);
      expect(f2.remainingAttempts).toBe(3);

      // 3rd failure
      const f3 = await recordJoinFailure(testUserId);
      expect(f3.isLocked).toBe(false);
      expect(f3.remainingAttempts).toBe(2);

      // 4th failure
      const f4 = await recordJoinFailure(testUserId);
      expect(f4.isLocked).toBe(false);
      expect(f4.remainingAttempts).toBe(1);

      // 5th failure: Should lock out!
      const f5 = await recordJoinFailure(testUserId);
      expect(f5.isLocked).toBe(true);
      expect(f5.remainingAttempts).toBe(0);
      expect(f5.lockoutSeconds).toBeGreaterThan(0);

      // Subsequent check should verify lockout
      const status = await checkJoinLockout(testUserId);
      expect(status.isLocked).toBe(true);
      expect(status.remainingSeconds).toBeGreaterThan(0);
    });

    it("should clear lockout immediately on resetJoinFailure", async () => {
      // Cause lockout
      for (let i = 0; i < 5; i++) {
        await recordJoinFailure(testUserId);
      }

      const lockedStatus = await checkJoinLockout(testUserId);
      expect(lockedStatus.isLocked).toBe(true);

      // Reset
      await resetJoinFailure(testUserId);

      const unlockedStatus = await checkJoinLockout(testUserId);
      expect(unlockedStatus.isLocked).toBe(false);
      expect(unlockedStatus.remainingSeconds).toBe(0);
    });
  });

  describe("Global & Auth Express Limiters", () => {
    it("should bypass globalLimiter for /health, /health/ready, and /ready endpoints", async () => {
      const resHealth = await runLimiter(globalLimiter, { path: "/health" });
      expect(resHealth.passed).toBe(true);

      const resReady = await runLimiter(globalLimiter, {
        path: "/health/ready",
      });
      expect(resReady.passed).toBe(true);

      const resShortReady = await runLimiter(globalLimiter, { path: "/ready" });
      expect(resShortReady.passed).toBe(true);
    });

    it("should block requests when rate limit exceeded", async () => {
      const email = "attacker@example.com";
      const reqOverrides = {
        path: "/auth/login",
        body: { email },
        ip: "192.168.1.100",
      };

      // Capacity for authAccountLimiter is 5
      for (let i = 0; i < 5; i++) {
        const result = await runLimiter(authAccountLimiter, reqOverrides);
        expect(result.passed).toBe(true);
      }

      // 6th attempt should trigger 429
      const blockedResult = await runLimiter(authAccountLimiter, reqOverrides);

      expect(blockedResult.passed).toBe(false);
      expect(blockedResult.statusCode).toBe(429);
      expect(blockedResult.data).toMatchObject({
        status: "error",
        message: expect.stringContaining("Too many failed login attempts"),
      });
    });
  });
});
