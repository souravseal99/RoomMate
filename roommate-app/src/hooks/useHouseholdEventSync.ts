import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { eventBus } from '@/lib/eventBus';
import { householdKeys } from '@/hooks/queries/useHouseholdQueries';
import { expenseKeys } from '@/hooks/queries/useExpenseQueries';
import type { AppEvent } from '@/types/eventTypes';
import { APP_EVENTS } from '@/types/eventTypes';

export function useHouseholdEventSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = eventBus.subscribe((event: AppEvent) => {
      switch (event.type) {
        case APP_EVENTS.HOUSEHOLD_MUTATED:
          queryClient.invalidateQueries({ queryKey: householdKeys.all });
          if (event.payload?.householdId) {
            queryClient.invalidateQueries({
              queryKey: householdKeys.members(event.payload.householdId),
            });
            queryClient.invalidateQueries({
              queryKey: expenseKeys.byHousehold(event.payload.householdId),
            });
            queryClient.invalidateQueries({
              queryKey: expenseKeys.balances(event.payload.householdId),
            });
          }
          break;
        case APP_EVENTS.ROSTER_UPDATED:
          if (event.payload?.householdId) {
            queryClient.invalidateQueries({
              queryKey: householdKeys.members(event.payload.householdId),
            });
          }
          break;
        case APP_EVENTS.EXPENSE_MUTATED:
        case APP_EVENTS.SETTLEMENT_RECORDED:
          if (event.payload?.householdId) {
            queryClient.invalidateQueries({
              queryKey: expenseKeys.byHousehold(event.payload.householdId),
            });
            queryClient.invalidateQueries({
              queryKey: expenseKeys.balances(event.payload.householdId),
            });
            queryClient.invalidateQueries({
              queryKey: expenseKeys.settlements(event.payload.householdId),
            });
            queryClient.invalidateQueries({
              queryKey: ['dashboard', event.payload.householdId],
            });
          }
          break;
        case APP_EVENTS.HOUSEHOLD_SWITCHED:
          // Synchronize active workspace across tabs
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
    };
  }, [queryClient]);
}
