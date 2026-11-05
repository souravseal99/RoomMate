import { AlertOctagon, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteHouseholdMutation } from '@/hooks/queries/useHouseholdQueries';
import { useToast } from '@/hooks/use-toast';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function DeleteHouseholdModal({ household, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const deleteMutation = useDeleteHouseholdMutation();

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(household.householdId);
      toast({
        title: 'Household Deleted',
        description: `"${household.name}" and all related data have been permanently deleted.`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to delete household.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border border-border max-w-md p-0 overflow-hidden shadow-xl rounded-2xl select-none">
        <DialogHeader className="p-6 bg-destructive/10 border-b border-border/60">
          <DialogTitle className="text-xl font-bold text-destructive flex items-center gap-2">
            <AlertOctagon className="w-5 h-5" />
            <span>Delete Household?</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground pt-1">
            This action is permanent and cannot be reversed.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="bg-surface-container border border-border p-4 rounded-xl space-y-2">
            <p className="text-xs font-bold text-foreground">
              Are you sure you want to permanently delete <strong>{household.name}</strong>?
            </p>
            <p className="text-xs text-muted-foreground">
              This will cascade delete all associated data for all members:
            </p>
            <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
              <li>All expenses and debt settlements</li>
              <li>All chores and assignment histories</li>
              <li>All inventory items and shopping list records</li>
              <li>All roommate memberships</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="p-6 bg-surface-container-high/30 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="min-h-[44px] bg-surface border-border hover:bg-surface-container text-foreground cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="min-h-[44px] bg-destructive hover:opacity-90 text-white font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 rounded-xl"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
