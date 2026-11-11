import api from '@/api/axios';
import type { ActivityItem, ToggleReactionResponse } from '@/types/activityTypes';

export const activityApi = {
  getActivities: async (householdId: string, filter?: string): Promise<ActivityItem[]> => {
    const params = filter && filter !== 'all' ? { filter } : {};
    const res = await api.get(`/household/${householdId}/activities`, {
      params,
    });
    return res?.activities || res?.data?.activities || [];
  },

  toggleReaction: async (
    householdId: string,
    activityId: string,
    emoji: string
  ): Promise<ToggleReactionResponse> => {
    const res = await api.post(`/household/${householdId}/activities/${activityId}/react`, {
      emoji,
    });
    return res.data;
  },
};

export default activityApi;
