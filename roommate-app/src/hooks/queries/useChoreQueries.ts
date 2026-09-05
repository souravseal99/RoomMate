import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { choreApi } from '@/api/choreApi';
import { eventBus } from '@/lib/eventBus';
import { APP_EVENTS } from '@/types/eventTypes';
import type { ChoreItem } from '@/types/choreTypes';

export function useHouseholdChoresQuery(householdId?: string | null) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event) => {
      if (
        event.type === APP_EVENTS.HOUSEHOLD_MUTATED ||
        event.type === APP_EVENTS.HOUSEHOLD_SWITCHED
      ) {
        queryClient.invalidateQueries({ queryKey: ['chores', householdId] });
      }
    });
    return () => unsubscribe();
  }, [householdId, queryClient]);

  return useQuery<ChoreItem[]>({
    queryKey: ['chores', householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const data = await choreApi.getChoresByHousehold(householdId);
      return (data || []).map((chore: any) => ({
        ...chore,
        assignedToName: chore.assignedTo?.name || '',
        priority: chore.priority || 'MEDIUM',
        notes: chore.notes || '',
      }));
    },
    enabled: !!householdId,
    staleTime: 1000 * 30, // 30s
  });
}

export function useCreateChoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newChore: Partial<ChoreItem>) => choreApi.createChore(newChore),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.householdId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useToggleChoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      choreId,
      updates,
    }: {
      choreId: string;
      householdId: string;
      updates: Partial<ChoreItem>;
    }) => choreApi.updateChore(choreId, updates),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.householdId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}

export function useDeleteChoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ choreId }: { choreId: string; householdId: string }) =>
      choreApi.deleteChore(choreId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chores', variables.householdId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', variables.householdId] });
      eventBus.publish({
        type: APP_EVENTS.HOUSEHOLD_MUTATED,
        payload: { householdId: variables.householdId },
      });
    },
  });
}
