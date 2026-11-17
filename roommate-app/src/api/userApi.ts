import api from '@/api/axios';

export interface UserProfileResponse {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
  households: Array<{
    householdId: string;
    name: string;
    role: 'ADMIN' | 'MEMBER';
    memberCount: number;
    createdAt?: string;
  }>;
  stats: {
    choresCompleted: number;
    spacesCount: number;
  };
}

export interface UserSession {
  sessionId: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
  rotatedAt?: string;
}

export const getProfile = async (): Promise<UserProfileResponse> => {
  const response = await api.get('/user/profile');
  return response.data.data;
};

export const updateProfile = async (data: { name: string }): Promise<UserProfileResponse> => {
  const response = await api.patch('/user/profile', data);
  return response.data.data;
};

export const changePassword = async (data: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  await api.post('/auth/change-password', data);
};

export const getSessions = async (): Promise<UserSession[]> => {
  const response = await api.get('/auth/sessions');
  return response.data.data;
};

export const revokeSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/auth/sessions/${sessionId}`);
};

export const revokeOtherSessions = async (): Promise<void> => {
  await api.delete('/auth/sessions/other');
};

export const deleteAccount = async (): Promise<void> => {
  await api.delete('/user/account');
};
