import api from '@/api/axios';
import type { HouseholdResponse } from '@/types/householdTypes';

const householdApi = () => {
  const fetchAll = async (): Promise<HouseholdResponse[]> => {
    const res = await api.get('/household/all');
    return res?.data?.household || res?.household || [];
  };

  const create = async (createHouseholdData: { name: string }) => {
    const data = await api.post('/household/create', createHouseholdData);
    return { data, status: 201 };
  };

  const deleteCascated = async (householdId: string) => {
    const data = await api.post('/household/delete', {
      householdId: householdId,
    });
    return { data, status: 200 };
  };

  const update = async (householdId: string, updateData: { name: string }) => {
    const data = await api.post('/household/update', {
      householdId,
      ...updateData,
    });
    return { data, status: 200 };
  };

  const join = async (inviteCode: string) => {
    const data = await api.post(`/household/join/${inviteCode}`, {});
    return { data, status: 200 };
  };

  return {
    fetchAll,
    create,
    deleteCascated,
    update,
    join,
  };
};

export default householdApi;
