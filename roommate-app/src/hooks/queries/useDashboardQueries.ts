import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dashboardApi from '@/api/dashboardApi';
import { eventBus } from '@/lib/eventBus';
import type { DashboardStats } from '@/types/dashboardTypes';

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
};

export function useDashboardQuery() {
  return useQuery<DashboardStats>({
    queryKey: dashboardKeys.stats(),
    queryFn: () => dashboardApi().fetchDashboardData(),
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
}

export function useQuickCompleteChoreMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ choreId, completed }: { choreId: string; completed: boolean }) =>
      dashboardApi().quickCompleteChore(choreId, completed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.invalidateQueries({ queryKey: ['chores'] });
      eventBus.publish({ type: 'HOUSEHOLD_MUTATED' });
    },
  });
}
