import { Redis, type RedisOptions } from "ioredis";

let redisClient: Redis | null = null;
let isConnected = false;

export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  const options: RedisOptions = {
    lazyConnect: true,
    enableOfflineQueue: false,
    maxRetriesPerRequest: 1,
    connectTimeout: 2000,
    retryStrategy(times) {
      // Exponential backoff with a cap of 10 seconds
      return Math.min(times * 500, 10000);
    },
  };

  try {
    redisClient = new Redis(redisUrl, options);

    redisClient.on("connect", () => {
      isConnected = true;
      console.log("[Redis] Successfully connected to Redis instance");
    });

    redisClient.on("ready", () => {
      isConnected = true;
    });

    redisClient.on("error", (err) => {
      isConnected = false;
      // Suppress spammy log outputs during offline periods
      if (process.env.NODE_ENV !== "test") {
        console.warn(`[Redis] Connection warning: ${err.message}`);
      }
    });

    redisClient.on("close", () => {
      isConnected = false;
    });

    // Initiate connection asynchronously without blocking server startup
    redisClient.connect().catch((err) => {
      if (process.env.NODE_ENV !== "test") {
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
    }
  }
}
