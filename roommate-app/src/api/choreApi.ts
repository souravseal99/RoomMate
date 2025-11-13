import axiosInstance from "./axios";
import type { ChoreItem } from "@/types/choreTypes";

export const choreApi = {
  getChoresByHousehold: async (householdId: string) => {
    const response = await axiosInstance.get(
      `/chore/household/${householdId}`
    );
    return response.data.data || response.data;
  },

  createChore: async (chore: Partial<ChoreItem>) => {
    const response = await axiosInstance.post(
      "/chore/add",
      chore
    );
    return response.data.data || response.data;
  },

  updateChore: async (choreId: string, updates: Partial<ChoreItem>) => {
    const response = await axiosInstance.post<{ data: ChoreItem }>(
      `/chore/update/${choreId}`,
      updates
    );
    return response.data.data;
  },

  deleteChore: async (choreId: string) => {
    const response = await axiosInstance.delete(`/chore/${choreId}`);
    return response.data;
  },
};
