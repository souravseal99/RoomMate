export interface InventoryItem {
  inventoryItemId: string;
  name: string;
  quantity: number;
  lowThreshold: number;
  householdId?: string;
  createdAt?: string;
  updatedAt?: string;
  lastUpdated?: string;
}

export interface ShoppingCartItem {
  shoppingCartId: string;
  itemName: string;
  quantity: number;
  householdId?: string;
  isPurchased?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateInventoryItemInput {
  name: string;
  quantity: number;
  lowThreshold: number;
  householdId: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  quantity?: number;
  lowThreshold?: number;
}

export interface CreateCartItemInput {
  itemName: string;
  quantity: number;
  householdId: string;
}

export interface UpdateCartItemInput {
  quantity?: number;
}
