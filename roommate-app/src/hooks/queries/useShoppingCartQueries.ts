import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import shoppingCartApi from '@/api/shoppingCartApi';
import type {
  ShoppingCartItem,
  CreateCartItemInput,
  UpdateCartItemInput,
} from '@/types/inventoryTypes';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import { inventoryKeys } from './useInventoryQueries';
import { toast } from 'sonner';

export const shoppingCartKeys = {
  all: ['shopping-cart'] as const,
  list: (householdId?: string) => [...shoppingCartKeys.all, 'list', householdId] as const,
};

export function useShoppingCartQuery(householdId?: string) {
  return useQuery<ShoppingCartItem[]>({
    queryKey: shoppingCartKeys.list(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      return await shoppingCartApi().getCartItemsByHousehold(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useAddToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateCartItemInput) => {
      return await shoppingCartApi().addItem(payload);
    },
    onSuccess: (newItem, variables) => {
      queryClient.invalidateQueries({
        queryKey: shoppingCartKeys.list(variables.householdId),
      });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
      toast.success(`"${newItem.itemName || variables.itemName}" added to shopping cart`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add item to cart');
    },
  });
}

export function useAddLowStockToCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (householdId: string) => {
      return await shoppingCartApi().addLowStockItems(householdId);
    },
    onSuccess: (_, householdId) => {
      queryClient.invalidateQueries({
        queryKey: shoppingCartKeys.list(householdId),
      });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId },
      });
      toast.success('Low stock items synchronized to shopping cart!');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to sync low stock items');
    },
  });
}

export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      householdId,
      data,
    }: {
      cartItemId: string;
      householdId: string;
      data: UpdateCartItemInput;
    }) => {
      return await shoppingCartApi().updateItem(cartItemId, data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shoppingCartKeys.list(variables.householdId),
      });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to update cart item');
    },
  });
}

export function useDeleteCartItemMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cartItemId,
      householdId,
    }: {
      cartItemId: string;
      householdId: string;
    }) => {
      return await shoppingCartApi().deleteItem(cartItemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shoppingCartKeys.list(variables.householdId),
      });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
      toast.success('Item removed from cart');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete cart item');
    },
  });
}

export function useCheckoutCartMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      householdId,
      purchasedItemIds,
    }: {
      householdId: string;
      purchasedItemIds: string[];
    }) => {
      // Delete purchased items from cart
      await Promise.all(
        purchasedItemIds.map((id) => shoppingCartApi().deleteItem(id))
      );
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shoppingCartKeys.list(variables.householdId),
      });
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(variables.householdId),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
      toast.success('Cart checked out! Stock updated.');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to checkout cart');
    },
  });
}
