import TokenStore from "@/lib/TokenStore";

export interface JWTPayload {
  userId: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

export function getCurrentUserId(): string | null {
  const token = TokenStore.getToken();
  if (!token) return null;

  try {
    // JWT payload is the second part (base64 encoded)
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Base64 decode with proper padding
    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const parsed = JSON.parse(decoded) as JWTPayload;
    return parsed.userId || null;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
