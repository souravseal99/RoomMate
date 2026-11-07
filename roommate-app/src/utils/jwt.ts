import TokenStore from '@/lib/TokenStore';

export interface JWTPayload {
  userId: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export function parseTokenPayload(rawToken?: string | null): JWTPayload | null {
  const token = rawToken ?? TokenStore.getToken();
  if (!token) return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded) as JWTPayload;
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
}

export function getCurrentUserId(): string | null {
  return parseTokenPayload()?.userId || null;
}

export function getTokenExpTimestampMs(rawToken?: string | null): number | null {
  const payload = parseTokenPayload(rawToken);
  return payload?.exp ? payload.exp * 1000 : null;
}
