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

  return {
    getAllHouseholdMembers,
  };
};

export default householdMemberApi;
