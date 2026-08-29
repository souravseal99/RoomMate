import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { eventBus } from '@/lib/eventBus';
import { householdKeys } from '@/hooks/queries/useHouseholdQueries';
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
          }
          break;
        case APP_EVENTS.ROSTER_UPDATED:
          if (event.payload?.householdId) {
            queryClient.invalidateQueries({
              queryKey: householdKeys.members(event.payload.householdId),
            });
          }
          break;
        case APP_EVENTS.HOUSEHOLD_SWITCHED:
          // Optionally synchronize active workspace across tabs
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
