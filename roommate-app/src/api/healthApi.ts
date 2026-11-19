import Api from '@/api/axios';

export interface HealthReadyResponse {
  status: string;
  database?: string;
  latencyMs?: number;
  dateTime?: string;
}

/**
 * Pings backend readiness endpoint (/health/ready) which performs a DB warm-up check.
 * Falls back to /health if /health/ready is unavailable.
 */
export const pingHealthReady = async (): Promise<HealthReadyResponse | null> => {
  try {
    const response = await Api.get<HealthReadyResponse>('/health/ready');
    return response;
  } catch {
    try {
      const fallback = await Api.get<HealthReadyResponse>('/health');
      return fallback;
    } catch (error) {
      console.warn('Backend readiness check failed (server may still be warming up):', error);
      return null;
    }
  }
};

// Alias for backwards compatibility
export const pingHealth = pingHealthReady;
