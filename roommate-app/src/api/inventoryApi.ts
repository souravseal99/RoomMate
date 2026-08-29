import api from '@/api/axios';
import type {
  InventoryItem,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from '@/types/inventoryTypes';

export const inventoryApi = () => {
  const getItemsByHousehold = async (householdId: string): Promise<InventoryItem[]> => {
    if (!householdId) return [];
    const res = await api.get(`/inventory/${householdId}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  };

  const createItem = async (data: CreateInventoryItemInput): Promise<InventoryItem> => {
    const res = await api.post('/inventory/add', data);
    return res?.data || res;
  };

  const updateItem = async (
    itemId: string,
    data: UpdateInventoryItemInput
  ): Promise<InventoryItem> => {
    const res = await api.patch(`/inventory/${itemId}`, data);
    return res?.data || res;
  };

  const deleteItem = async (itemId: string): Promise<void> => {
    await api.delete(`/inventory/${itemId}`);
  };

  return {
    getItemsByHousehold,
    createItem,
    updateItem,
    deleteItem,
  };
};

export default inventoryApi;
