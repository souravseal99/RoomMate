import Api from "@/api/axios";
import type { ShoppingCartItem } from "@/types/shoppingCartTypes";

export const getCartItemsByHouseholdId = async (householdId: string) => {
  return await Api.get(`/shopping-cart/${householdId}`);
};

export const addToShoppingCart = async (itemName: string, quantity: number, householdId: string) => {
  return await Api.post("/shopping-cart/add", {
    itemName,
    quantity,
    householdId,
  });
};

export const addLowStockToCart = async (householdId: string) => {
  return await Api.post(`/shopping-cart/add-low-stock/${householdId}`, {});
};

export const updateCartItem = async (cartItemId: string, quantity: number) => {
  return await Api.patch(`/shopping-cart/${cartItemId}`, { quantity });
};

export const removeFromCart = async (cartItemId: string) => {
  return await Api.delete(`/shopping-cart/${cartItemId}`);
};