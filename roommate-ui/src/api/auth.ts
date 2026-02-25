import axios from 'axios';

const API_BASE = '/api';

export function getSessionId(): string {
  let sessionId = localStorage.getItem('roommate_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('roommate_session_id', sessionId);
  }
  return sessionId;
}

function getHeaders() {
  const sessionId = getSessionId();
  return {
    'x-session-id': sessionId,
  };
}

interface AuthResponse {
  message: string;
  data?: {
    user?: {
      name: string;
      email: string;
    };
    accessToken?: string;
  };
}

export async function login(
  email: string,
  password: string,
  sessionId: string
): Promise<AuthResponse> {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/login`,
      { email, password },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
}

export async function register(
  name: string,
  email: string,
  password: string,
  sessionId: string
): Promise<AuthResponse> {
  try {
    const response = await axios.post(
      `${API_BASE}/auth/register`,
      { name, email, password },
      { headers: getHeaders() }
    );
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
}

export async function logout(sessionId: string): Promise<void> {
  try {
    await axios.get(`${API_BASE}/auth/logout`, {
      headers: getHeaders(),
    });
  } catch (error: any) {
    // Ignore logout errors
  }
}

export async function refreshSession(sessionId: string): Promise<AuthResponse> {
  try {
    const response = await axios.get(`${API_BASE}/auth/refresh`, {
      headers: getHeaders(),
    });
    return response.data;
  } catch (error: any) {
    throw new Error('Session expired');
  }
}
