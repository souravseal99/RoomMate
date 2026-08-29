import api from '@/api/axios';
import type { HouseholdMember } from '@/types/householdTypes';

const householdMemberApi = () => {
  const getAllHouseholdMembers = async (householdId: string): Promise<HouseholdMember[]> => {
    try {
      if (!householdId) return [];
      const data = await api.get(`/household-member/all/${householdId}`);

      if (!data) {
        throw new Error('Failed to fetch household members');
      }

      return data;
    } catch (error) {
      console.error('Error fetching household members:', error);
      return [];
    }
  };

  const leaveHousehold = async (householdId: string) => {
    const data = await api.post(`/household-member/leave/${householdId}`, {});
    return { data, status: 200 };
  };

  return {
    getAllHouseholdMembers,
    leaveHousehold,
  };
};

export default householdMemberApi;
