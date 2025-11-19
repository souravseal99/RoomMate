import axiosInstance from "@/api/axios";
import type { InventoryItem } from "@/types/inventoryTypes";

export const updateInventoryItem = async (
  itemId: string,
  updateData: Partial<InventoryItem>
) => {
  const response = await axiosInstance.patch(`/inventory/${itemId}`, updateData);
  return response.data;
};

export const createInventoryItem = async (itemData: Omit<InventoryItem, "id" | "lastUpdated"> & { householdId: string }) => {
  const response = await axiosInstance.post("/inventory/add", itemData);
  return response.data;
};

export const getInventoryItems = async (householdId: string) => {
  const response = await axiosInstance.get(`/inventory/${householdId}`);
  return response.data;
};