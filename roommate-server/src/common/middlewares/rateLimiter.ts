import { Request, Response, NextFunction } from "express";
import {
  rateLimit,
  type Options,
  type Store,
  type IncrementResponse,
  type RateLimitRequestHandler,
} from "express-rate-limit";
import { getRedisClient, isRedisReady } from "@common/utils/redis";
import * as crypto from "crypto";

// ==============================================================================
// 1. Redis Lua Script for Atomic Token Bucket
// ==============================================================================
const TOKEN_BUCKET_LUA = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local requested = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

local data = redis.call('HMGET', key, 'tokens', 'lastUpdated')
local tokens = tonumber(data[1])
local lastUpdated = tonumber(data[2])

if tokens == nil or lastUpdated == nil then
  tokens = capacity
  lastUpdated = now
else
  local delta = math.max(0, now - lastUpdated)
  tokens = math.min(capacity, tokens + (delta * refillRate))
  lastUpdated = now
end

local allowed = 0
local remaining = tokens

if tokens >= requested then
  allowed = 1
  tokens = tokens - requested
  remaining = tokens
  redis.call('HMSET', key, 'tokens', tokens, 'lastUpdated', lastUpdated)
  redis.call('EXPIRE', key, ttl)
else
  allowed = 0
  remaining = tokens
end

local waitSeconds = 0
if refillRate > 0 then
  if allowed == 0 then
    waitSeconds = math.ceil((requested - tokens) / refillRate)
  else
    waitSeconds = math.ceil((capacity - tokens) / refillRate)
  end
end

return { allowed, math.floor(remaining), waitSeconds }
`;

// ==============================================================================
// 2. Circuit Breaker (CLOSED, OPEN, HALF_OPEN)
// ==============================================================================
enum CircuitState {
  CLOSED = "CLOSED",
  OPEN = "OPEN",
  HALF_OPEN = "HALF_OPEN",
}

class CircuitBreaker {
  private state = CircuitState.CLOSED;
  private consecutiveFailures = 0;
  private lastFailureTime = 0;
  private readonly failureThreshold = 3;
  private readonly cooldownPeriodMs = 10000; // 10 seconds

  isOpen(): boolean {
    const now = Date.now();
    if (this.state === CircuitState.OPEN) {
      if (now - this.lastFailureTime > this.cooldownPeriodMs) {
        this.state = CircuitState.HALF_OPEN;
        return false; // allow one probe request
      }
      return true;
    }
    return false;
  }

  recordSuccess(): void {
    this.consecutiveFailures = 0;
    this.state = CircuitState.CLOSED;
  }

  recordFailure(): void {
    this.consecutiveFailures += 1;
    this.lastFailureTime = Date.now();
    if (this.consecutiveFailures >= this.failureThreshold) {
      this.state = CircuitState.OPEN;
      if (process.env.NODE_ENV !== "test") {
        console.warn(
          "[RateLimiter] Circuit Breaker tripped to OPEN. Using local memory fallback.",
        );
      }
    }
  }

  getState(): CircuitState {
    return this.state;
  }
}

// ==============================================================================
// 3. Local In-Memory Fallback Store (Bounded LRU)
// ==============================================================================
interface LocalBucket {
  tokens: number;
  lastUpdated: number;
}

class LocalTokenBucket {
  private buckets = new Map<string, LocalBucket>();
  private readonly maxEntries = 10000;

  consume(
    key: string,
    capacity: number,
    refillRate: number,
    now: number,
  ): { allowed: boolean; remaining: number; waitSeconds: number } {
    if (this.buckets.size > this.maxEntries) {
      // Evict oldest 20% when capacity reached
      const keys = Array.from(this.buckets.keys()).slice(
        0,
        Math.floor(this.maxEntries * 0.2),
      );
      for (const k of keys) this.buckets.delete(k);
    }

    let bucket = this.buckets.get(key);
    if (!bucket) {
      bucket = { tokens: capacity, lastUpdated: now };
    } else {
      const delta = Math.max(0, now - bucket.lastUpdated);
      bucket.tokens = Math.min(capacity, bucket.tokens + delta * refillRate);
      bucket.lastUpdated = now;
    }

    let allowed = false;
    if (bucket.tokens >= 1) {
      allowed = true;
      bucket.tokens -= 1;
    }

    this.buckets.set(key, bucket);

    const waitSeconds =
      refillRate > 0
        ? allowed
          ? Math.ceil((capacity - bucket.tokens) / refillRate)
          : Math.ceil((1 - bucket.tokens) / refillRate)
        : 0;

    return {
      allowed,
      remaining: Math.floor(bucket.tokens),
      waitSeconds,
    };
  }

  resetKey(key: string): void {
    this.buckets.delete(key);
  }

  resetAll(): void {
    this.buckets.clear();
  }
}

// ==============================================================================
// 4. TokenBucketStore implementing express-rate-limit Store interface
// ==============================================================================
export interface TokenBucketOptions {
  capacity: number;
  windowMs: number;
  prefix?: string;
}

export class TokenBucketStore implements Store {
  capacity: number;
  refillRate: number; // tokens per second
  windowSeconds: number;
  prefix?: string;
  localKeys?: boolean;
  private circuitBreaker = new CircuitBreaker();
  private localStore = new LocalTokenBucket();

  constructor(options: TokenBucketOptions) {
    this.capacity = options.capacity;
    this.windowSeconds = Math.max(1, Math.floor(options.windowMs / 1000));
    this.refillRate = this.capacity / this.windowSeconds;
    this.prefix = options.prefix || "rl:tb:";
  }

  init(_options: Options): void {
    // Required by express-rate-limit Store interface
  }

  async increment(key: string): Promise<IncrementResponse> {
    const fullKey = `${this.prefix}${key}`;
    const nowSeconds = Math.floor(Date.now() / 1000);
    const ttlSeconds = this.windowSeconds * 2;

    const redis = getRedisClient();

    if (redis && isRedisReady() && !this.circuitBreaker.isOpen()) {
      try {
        const result = (await redis.eval(
          TOKEN_BUCKET_LUA,
          1,
          fullKey,
          this.capacity,
          this.refillRate,
          nowSeconds,
          1,
          ttlSeconds,
        )) as [number, number, number];

        this.circuitBreaker.recordSuccess();

        const [allowed, remaining, waitSeconds] = result;
        const totalHits =
          allowed === 1 ? this.capacity - remaining : this.capacity + 1;
        const resetTime = new Date(Date.now() + waitSeconds * 1000);

        return { totalHits, resetTime };
      } catch (error) {
        this.circuitBreaker.recordFailure();
        if (process.env.NODE_ENV !== "test") {
          console.warn(
            "[RateLimiter] Redis eval failed, falling back to local memory:",
            error,
          );
        }
      }
    }

    // Local in-memory fallback
    const { allowed, remaining, waitSeconds } = this.localStore.consume(
      fullKey,
      this.capacity,
      this.refillRate,
      nowSeconds,
    );

    const totalHits = allowed ? this.capacity - remaining : this.capacity + 1;
    const resetTime = new Date(Date.now() + waitSeconds * 1000);

    return { totalHits, resetTime };
  }

  async decrement(_key: string): Promise<void> {
    // Token bucket regenerates via time; decrement is a no-op
  }

  async resetKey(key: string): Promise<void> {
    const fullKey = `${this.prefix}${key}`;
    this.localStore.resetKey(fullKey);

    const redis = getRedisClient();
    if (redis && isRedisReady() && !this.circuitBreaker.isOpen()) {
      try {
        await redis.del(fullKey);
      } catch {
        // Silently ignore during reset
      }
    }
  }

  async resetAll(): Promise<void> {
    this.localStore.resetAll();
  }
}

// ==============================================================================
// 5. Shared Standard Rate-Limit Error Formatter
// ==============================================================================
function standardLimitHandler(
  message: string,
): (req: Request, res: Response, next: NextFunction, options: Options) => void {
  return (
    _req: Request,
    res: Response,
    _next: NextFunction,
    options: Options,
  ) => {
    res.status(options.statusCode).json({
      status: "error",
      message,
      retryAfterSeconds: Math.ceil((options.windowMs || 60000) / 1000),
    });
  };
}

// Helper to reliably extract IP
function extractIp(req: Request): string {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || req.socket.remoteAddress || "127.0.0.1";
}

// ==============================================================================
// 6. Configured Rate Limiting Policies (The 8 Policies)
// ==============================================================================

/**
 * 1. Global Limiter: 120 req/60s per IP (Exempts /health)
 */
export const globalLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 120,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: (req: Request) => req.path === "/health",
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 120,
    windowMs: 60 * 1000,
    prefix: "rl:global:",
  }),
  handler: standardLimitHandler(
    "Too many requests from this IP, please try again in a minute.",
  ),
});

/**
 * 2. Auth Account Strict Limiter: 5 attempts/15m per account email
 */
export const authAccountLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const email = (req.body?.email || "").toLowerCase().trim();
    if (!email) return extractIp(req);
    return crypto.createHash("sha256").update(email).digest("hex");
  },
  store: new TokenBucketStore({
    capacity: 5,
    windowMs: 15 * 60 * 1000,
    prefix: "rl:auth_acc:",
  }),
  handler: standardLimitHandler(
    "Too many failed login attempts for this account. Please try again in 15 minutes.",
  ),
});

/**
 * 3. Auth IP Limiter: 30 attempts/15m per IP
 */
export const authIpLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 30,
    windowMs: 15 * 60 * 1000,
    prefix: "rl:auth_ip:",
  }),
  handler: standardLimitHandler(
    "Too many login attempts from this network. Please try again in 15 minutes.",
  ),
});

/**
 * 4. Register Limiter: 5 registrations/15m per IP
 */
export const authRegisterLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 5,
    windowMs: 15 * 60 * 1000,
    prefix: "rl:auth_reg:",
  }),
  handler: standardLimitHandler(
    "Too many accounts created from this network. Please try again later.",
  ),
});

/**
 * 5. CSRF Token Limiter: 20 fetches/60s per IP
 */
export const csrfTokenLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 20,
    windowMs: 60 * 1000,
    prefix: "rl:csrf:",
  }),
  handler: standardLimitHandler(
    "Too many CSRF token requests. Please try again shortly.",
  ),
});

/**
 * 6. Auth Refresh Limiter: 10 refreshes/60s per IP
 */
export const authRefreshLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 10,
    windowMs: 60 * 1000,
    prefix: "rl:refresh:",
  }),
  handler: standardLimitHandler(
    "Too many token refresh requests. Please try again shortly.",
  ),
});

/**
 * 7. Invite Lookup Limiter: 10 guesses/60s per IP
 */
export const inviteLookupLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 10,
    windowMs: 60 * 1000,
    prefix: "rl:invite:",
  }),
  handler: standardLimitHandler(
    "Too many join attempts. Please try again shortly.",
  ),
});

/**
 * 8. Authenticated Limiter: 300 req/60s per authenticated user (or IP fallback)
 */
export const authenticatedLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const user = (req as any).user;
    if (user && user.userId) {
      return `usr:${user.userId}`;
    }
    return `ip:${extractIp(req)}`;
  },
  store: new TokenBucketStore({
    capacity: 300,
    windowMs: 60 * 1000,
    prefix: "rl:auth_user:",
  }),
  handler: standardLimitHandler(
    "Account rate limit exceeded. Please slow down your requests.",
  ),
});

/**
 * 9. Dev Seed Limiter: 2 requests/60s per IP (Prevents command execution fork bomb)
 */
export const devSeedLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  limit: 2,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  keyGenerator: (req: Request) => extractIp(req),
  store: new TokenBucketStore({
    capacity: 2,
    windowMs: 60 * 1000,
    prefix: "rl:dev_seed:",
  }),
  handler: standardLimitHandler(
    "Too many database seed requests. Please wait a minute before retrying.",
  ),
});

// ==============================================================================
// 7. Join Failure Counter & 30-Minute Lockout Helpers
// ==============================================================================
const localFailures = new Map<string, { count: number; lockedUntil: number }>();
const MAX_JOIN_FAILURES = 5;
const LOCKOUT_DURATION_SECONDS = 30 * 60; // 30 minutes
const ROLLING_WINDOW_SECONDS = 15 * 60; // 15 minutes

export async function checkJoinLockout(
  userId: string,
): Promise<{ isLocked: boolean; remainingSeconds: number }> {
  const now = Math.floor(Date.now() / 1000);
  const lockKey = `rl:join_lock:${userId}`;

  const redis = getRedisClient();
  if (redis && isRedisReady()) {
    try {
      const ttl = await redis.ttl(lockKey);
      if (ttl > 0) {
        return { isLocked: true, remainingSeconds: ttl };
      }
    } catch {
      // Fall through to local check
    }
  }

  // Local check
  const record = localFailures.get(userId);
  if (record && record.lockedUntil > now) {
    return {
      isLocked: true,
      remainingSeconds: record.lockedUntil - now,
    };
  }

  return { isLocked: false, remainingSeconds: 0 };
}

export async function recordJoinFailure(userId: string): Promise<{
  isLocked: boolean;
  remainingAttempts: number;
  lockoutSeconds: number;
}> {
  const now = Math.floor(Date.now() / 1000);
  const failKey = `rl:join_fail:${userId}`;
  const lockKey = `rl:join_lock:${userId}`;

  const redis = getRedisClient();
  if (redis && isRedisReady()) {
    try {
      const count = await redis.incr(failKey);
      if (count === 1) {
        await redis.expire(failKey, ROLLING_WINDOW_SECONDS);
      }

      if (count >= MAX_JOIN_FAILURES) {
        await redis.set(lockKey, "1", "EX", LOCKOUT_DURATION_SECONDS);
        await redis.del(failKey);
        return {
          isLocked: true,
          remainingAttempts: 0,
          lockoutSeconds: LOCKOUT_DURATION_SECONDS,
        };
      }

      return {
        isLocked: false,
        remainingAttempts: MAX_JOIN_FAILURES - count,
        lockoutSeconds: 0,
      };
    } catch {
      // Fall through to local record
    }
  }

  // Local fallback
  let record = localFailures.get(userId);
  if (!record) {
    record = { count: 1, lockedUntil: 0 };
  } else if (record.lockedUntil > 0 && record.lockedUntil < now) {
    // Previous lockout has expired, start a fresh cycle
    record = { count: 1, lockedUntil: 0 };
  } else {
    record.count += 1;
  }

  if (record.count >= MAX_JOIN_FAILURES) {
    record.lockedUntil = now + LOCKOUT_DURATION_SECONDS;
    record.count = 0;
    localFailures.set(userId, record);
    return {
      isLocked: true,
      remainingAttempts: 0,
      lockoutSeconds: LOCKOUT_DURATION_SECONDS,
    };
  }

  localFailures.set(userId, record);
  return {
    isLocked: false,
    remainingAttempts: MAX_JOIN_FAILURES - record.count,
    lockoutSeconds: 0,
  };
}

export async function resetJoinFailure(userId: string): Promise<void> {
  const failKey = `rl:join_fail:${userId}`;
  const lockKey = `rl:join_lock:${userId}`;

  localFailures.delete(userId);

  const redis = getRedisClient();
  if (redis && isRedisReady()) {
    try {
      await redis.del(failKey, lockKey);
    } catch {
      // Silent error handling on reset
    }
  }
}
