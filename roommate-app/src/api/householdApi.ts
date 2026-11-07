import api from '@/api/axios';
import type {
  HouseholdResponse,
  KitchenTableData,
  BroadcastKitchenTableDto,
  ToggleKitchenTableRsvpDto,
} from '@/types/householdTypes';

const householdApi = () => {
  const fetchAll = async (): Promise<HouseholdResponse[]> => {
    const res = await api.get('/household/all');
    return res?.data?.household || res?.household || [];
  };

  const create = async (createHouseholdData: { name: string; settings?: any }) => {
    const data = await api.post('/household/create', createHouseholdData);
    return { data, status: 201 };
  };

  const deleteCascated = async (householdId: string) => {
    const data = await api.post('/household/delete', {
      householdId: householdId,
    });
    return { data, status: 200 };
  };

  const update = async (householdId: string, updateData: { name?: string; settings?: any }) => {
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

  const getKitchenTable = async (householdId: string): Promise<KitchenTableData | null> => {
    const res = await api.get(`/household/${householdId}/kitchen-table`);
    return res?.data?.kitchenTable ?? null;
  };

  const broadcastKitchenTable = async (
    householdId: string,
    payload: BroadcastKitchenTableDto
  ): Promise<KitchenTableData> => {
    const res = await api.post(`/household/${householdId}/kitchen-table/broadcast`, payload);
    return res?.data?.kitchenTable;
  };

  const toggleKitchenTableRsvp = async (
    householdId: string,
    payload: ToggleKitchenTableRsvpDto
  ): Promise<KitchenTableData> => {
    const res = await api.post(`/household/${householdId}/kitchen-table/rsvp`, payload);
    return res?.data?.kitchenTable;
  };

  const acknowledgeNotice = async (householdId: string): Promise<KitchenTableData> => {
    const res = await api.post(`/household/${householdId}/kitchen-table/notice/ack`, {});
    return res?.data?.kitchenTable;
  };

  const replyQna = async (
    householdId: string,
    payload: { text: string }
  ): Promise<KitchenTableData> => {
    const res = await api.post(`/household/${householdId}/kitchen-table/qna/reply`, payload);
    return res?.data?.kitchenTable;
  };

  return {
    fetchAll,
    create,
    deleteCascated,
    update,
    join,
    getKitchenTable,
    broadcastKitchenTable,
    toggleKitchenTableRsvp,
    acknowledgeNotice,
    replyQna,
  };
};

export default householdApi;
