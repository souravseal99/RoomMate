import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import inventoryApi from '@/api/inventoryApi';
import type {
  InventoryItem,
  CreateInventoryItemInput,
  UpdateInventoryItemInput,
} from '@/types/inventoryTypes';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import { toast } from 'sonner';

export const inventoryKeys = {
  all: ['inventory'] as const,
  list: (householdId?: string) => [...inventoryKeys.all, 'list', householdId] as const,
};

export function useInventoryQuery(householdId?: string) {
  return useQuery<InventoryItem[]>({
    queryKey: inventoryKeys.list(householdId),
    queryFn: async () => {
      if (!householdId) return [];
      return await inventoryApi().getItemsByHousehold(householdId);
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInventoryItemInput) => {
      return await inventoryApi().createItem(payload);
    },
    onSuccess: (newItem, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(variables.householdId),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
      toast.success(`"${newItem.name || variables.name}" added to pantry`);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to add item');
    },
  });
}

export function useUpdateInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      householdId: _householdId,
      data,
    }: {
      itemId: string;
      householdId: string;
      data: UpdateInventoryItemInput;
    }) => {
      return await inventoryApi().updateItem(itemId, data);
    },
    onMutate: async ({ itemId, householdId, data }) => {
      await queryClient.cancelQueries({ queryKey: inventoryKeys.list(householdId) });
      const previousItems = queryClient.getQueryData<InventoryItem[]>(
        inventoryKeys.list(householdId)
      );

      if (previousItems) {
        queryClient.setQueryData<InventoryItem[]>(
          inventoryKeys.list(householdId),
          previousItems.map((item) =>
            item.inventoryItemId === itemId ? { ...item, ...data } : item
          )
        );
      }

      return { previousItems, householdId };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousItems && context?.householdId) {
        queryClient.setQueryData(
          inventoryKeys.list(context.householdId),
          context.previousItems
        );
      }
      toast.error('Failed to update inventory quantity');
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(variables.householdId),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useDeleteInventoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      itemId,
      householdId: _householdId,
    }: {
      itemId: string;
      householdId: string;
    }) => {
      return await inventoryApi().deleteItem(itemId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: inventoryKeys.list(variables.householdId),
      });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
      toast.success('Item removed from pantry');
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || 'Failed to delete item');
    },
  });
}
