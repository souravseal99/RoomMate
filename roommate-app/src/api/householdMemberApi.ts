import api from "@/api/axios";

const householdMemberApi = () => {
  const getAllHouseholdMembers = async (
    householdId: string
  ): Promise<any[]> => {
    try {
      if (householdId === undefined) return [];
      const { data } = await api.get(`/household-member/all/${householdId}`);

      if (!data) {
        throw new Error("Failed to fetch household members");
      }

      return data;
    } catch (error) {
      console.error("Error fetching household members:", error);
      return [];
    }
  };

  const leaveHousehold = async (householdId: string) => {
    const { data, status } = await api.post(`/household-member/leave/${householdId}`);
    return { data, status };
  };

  return {
    getAllHouseholdMembers,
    leaveHousehold,
  };
};

export default householdMemberApi;
