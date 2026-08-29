import api from '@/api/axios';

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export const userApi = () => {
  const getProfile = async (): Promise<UserProfile> => {
    const res = await api.get('/user/profile');
    return res?.data || res;
  };

  const updateProfile = async (data: { name?: string }): Promise<UserProfile> => {
    const res = await api.patch('/user/profile', data);
    return res?.data || res;
  };

  return {
    getProfile,
    updateProfile,
  };
};

export default userApi;
