import { z } from 'zod';

export const inventoryItemSchema = z.object({
  name: z.string().min(1, 'Item name is required').max(50, 'Item name is too long'),
  quantity: z.coerce.number().min(0, 'Quantity must be at least 0'),
  lowThreshold: z.coerce.number().min(0, 'Min threshold must be at least 0'),
});

export type InventoryItemFormValues = z.infer<typeof inventoryItemSchema>;
