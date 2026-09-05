import axiosInstance from './axios';
import type { ChoreItem } from '@/types/choreTypes';

export const choreApi = {
  getChoresByHousehold: async (householdId: string): Promise<ChoreItem[]> => {
    const response = await axiosInstance.get<{ data?: ChoreItem[] } | ChoreItem[]>(`/chore/household/${householdId}`);
    return (response as { data: ChoreItem[] }).data || response;
  },

  createChore: async (chore: Partial<ChoreItem>): Promise<ChoreItem> => {
    const response = await axiosInstance.post<{ data?: ChoreItem } | ChoreItem>('/chore/add', chore);
    return (response as { data: ChoreItem }).data || response as ChoreItem;
  },

  updateChore: async (choreId: string, updates: Partial<ChoreItem>): Promise<ChoreItem> => {
    const response = await axiosInstance.post<{ data?: ChoreItem } | ChoreItem>(
      `/chore/update/${choreId}`,
      updates
    );
    return (response as { data: ChoreItem }).data || response as ChoreItem;
  },

  deleteChore: async (choreId: string) => {
    const response = await axiosInstance.delete(`/chore/${choreId}`);
    return response;
  },
};
