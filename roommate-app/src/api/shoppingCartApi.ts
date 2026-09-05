import api from '@/api/axios';
import type {
  ShoppingCartItem,
  CreateCartItemInput,
  UpdateCartItemInput,
} from '@/types/inventoryTypes';

export const shoppingCartApi = () => {
  const getCartItemsByHousehold = async (
    householdId: string
  ): Promise<ShoppingCartItem[]> => {
    if (!householdId) return [];
    const res = await api.get(`/shopping-cart/${householdId}`);
    return Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
  };

  const addItem = async (data: CreateCartItemInput): Promise<ShoppingCartItem> => {
    const res = await api.post('/shopping-cart/add', data);
    return res?.data || res;
  };

  const addLowStockItems = async (
    householdId: string
  ): Promise<{ count: number }> => {
    const res = await api.post(`/shopping-cart/add-low-stock/${householdId}`, {});
    return res?.data || res;
  };

  const updateItem = async (
    cartItemId: string,
    data: UpdateCartItemInput
  ): Promise<ShoppingCartItem> => {
    const res = await api.patch(`/shopping-cart/${cartItemId}`, data);
    return res?.data || res;
  };

  const deleteItem = async (cartItemId: string): Promise<void> => {
    await api.delete(`/shopping-cart/${cartItemId}`);
  };

  return {
    getCartItemsByHousehold,
    addItem,
    addLowStockItems,
    updateItem,
    deleteItem,
  };
};

export default shoppingCartApi;
