export interface InventoryItem {
  inventoryItemId?: string;
  name: string;
  quantity: number;
  lowThreshold: number;
  lastUpdated: string;
}
