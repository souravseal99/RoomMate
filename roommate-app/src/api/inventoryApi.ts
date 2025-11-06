import axiosInstance from "./axios";
import type { InventoryItem } from "@/types/inventoryTypes";

export const updateInventoryItem = async (
  itemId: string,
  updateData: Partial<InventoryItem>
) => {
  const response = await axiosInstance.patch(`/inventory/${itemId}`, updateData);
  return response.data;
};

export const createInventoryItem = async (itemData: Omit<InventoryItem, "id" | "lastUpdated">) => {
  const response = await axiosInstance.post("/inventory/add", itemData);
  return response.data;
};