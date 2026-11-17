import "dotenv/config";
import { Redis, type RedisOptions } from "ioredis";

let redisClient: Redis | null = null;
let isConnected = false;
let hasLoggedNoRedis = false;
let hasLoggedMaxRetries = false;

export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL?.trim();

  // In production or hosted environments (e.g. Render), if REDIS_URL is not set or empty,
  // do not attempt to connect to localhost:6379; operate purely in local in-memory fallback mode.
  if (!redisUrl) {
    if (
      process.env.NODE_ENV === "production" ||
      process.env.DISABLE_REDIS === "true"
    ) {
      if (!hasLoggedNoRedis && process.env.NODE_ENV !== "test") {
        hasLoggedNoRedis = true;
        console.log(
          "[Redis] REDIS_URL not configured. Operating in local in-memory fallback mode.",
        );
      }
      return null;
    }
  }

  const targetUrl = redisUrl || "redis://localhost:6379";

  const options: RedisOptions = {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 5000,
    retryStrategy(times) {
      // Cease reconnection attempts after 3 failures to prevent spamming logs when Redis is down
      if (times > 3) {
        if (!hasLoggedMaxRetries && process.env.NODE_ENV !== "test") {
          hasLoggedMaxRetries = true;
          console.warn(
            "[Redis] Maximum reconnection attempts reached (3). Operating in local in-memory fallback mode.",
          );
        }
        return null; // Returning null stops ioredis from retrying indefinitely
      }
      return Math.min(times * 1000, 3000);
    },
  };

  // Support for TLS cloud Redis instances (e.g. Upstash, Render, AWS rediss:// protocol)
  if (targetUrl.startsWith("rediss://")) {
    options.tls = {
      rejectUnauthorized: false,
    };
  }

  try {
    const maskedUrl = targetUrl.replace(/:[^:@]+@/, ":****@");
    if (process.env.NODE_ENV !== "test") {
      console.log(`[Redis] Initializing connection to ${maskedUrl}...`);
    }

    redisClient = new Redis(targetUrl, options);

    redisClient.on("connect", () => {
      isConnected = true;
      hasLoggedMaxRetries = false;
      console.log("[Redis] Successfully connected to Redis instance");
    });

    redisClient.on("ready", () => {
      isConnected = true;
      hasLoggedMaxRetries = false;
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      // Suppress spammy log outputs once maximum retry threshold has been reached
      if (process.env.NODE_ENV !== "test" && !hasLoggedMaxRetries) {
        console.warn(`[Redis] Connection warning: ${err.message}`);
      }
    });

    redisClient.on("close", () => {
      isConnected = false;
    });

    // Initiate connection asynchronously without blocking server startup
    redisClient.connect().catch((err) => {
      if (process.env.NODE_ENV !== "test" && !hasLoggedMaxRetries) {
        console.warn(
          `[Redis] Initial connection attempt failed: ${err.message}. Operating with local fallback.`,
        );
      }
    });

    return redisClient;
  } catch (error) {
    console.error("[Redis] Initialization failed:", error);
    return null;
  }
}

export function isRedisReady(): boolean {
  return isConnected && redisClient !== null && redisClient.status === "ready";
}

export async function closeRedis(): Promise<void> {
  if (redisClient) {
    try {
      await redisClient.quit();
    } catch {
      redisClient.disconnect();
    } finally {
      redisClient = null;
      isConnected = false;
      hasLoggedNoRedis = false;
      hasLoggedMaxRetries = false;
    }
  }
}
