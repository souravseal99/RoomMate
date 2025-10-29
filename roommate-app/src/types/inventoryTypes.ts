export interface InventoryItem {
  id?: string;
  name: string;
  quantity: number;
  lowThreshold: number;
  lastUpdated: string;
}
