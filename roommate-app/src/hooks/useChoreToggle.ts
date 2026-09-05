import { useQuickCompleteChoreMutation } from '@/hooks/queries/useDashboardQueries';
import { useToast } from '@/hooks/use-toast';
import type { RecentChoreActivity } from '@/types/dashboardTypes';

export function useChoreToggle() {
  const { toast } = useToast();
  const completeMutation = useQuickCompleteChoreMutation();

  const toggleChore = async (chore: RecentChoreActivity) => {
    const nextCompleted = chore.status !== 'COMPLETED';
    try {
      await completeMutation.mutateAsync({
        choreId: chore.id,
        completed: nextCompleted,
      });
      toast({
        title: nextCompleted ? 'Chore Completed! 🎉' : 'Chore Reopened',
        description: `"${chore.title}" has been updated.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update chore status.',
        variant: 'destructive',
      });
    }
  };

  return {
    toggleChore,
    isUpdating: completeMutation.isPending,
  };
}
