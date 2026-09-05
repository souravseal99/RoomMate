import { AlertTriangle, Loader2, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useLeaveHouseholdMutation } from '@/hooks/queries/useHouseholdQueries';
import { useToast } from '@/hooks/use-toast';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LeaveHouseholdModal({ household, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const leaveMutation = useLeaveHouseholdMutation();

  const handleLeave = async () => {
    try {
      await leaveMutation.mutateAsync(household.householdId);
      toast({
        title: 'Left Household',
        description: `You have successfully left "${household.name}".`,
      });
      onOpenChange(false);
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err?.response?.data?.message || 'Failed to leave household.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-surface border-2 border-border max-w-md p-0 overflow-hidden shadow-tactile rounded-lg">
        <DialogHeader className="p-content-padding bg-surface-container border-b border-border">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <LogOut className="w-5 h-5 text-destructive" />
            Leave Household?
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Are you sure you want to leave <strong>{household.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="p-content-padding space-y-4">
          <div className="bg-surface-container border border-border p-3.5 rounded-lg flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="font-bold text-foreground">What happens next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You will lose access to all shared expenses, chores, and inventory.</li>
                <li>Your pending balances will remain visible until settled.</li>
                <li>You will need an invite link to rejoin this space.</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="p-content-padding bg-surface-container-high/30 border-t border-border flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={leaveMutation.isPending}
            className="bg-surface border-border hover:bg-surface-container text-foreground cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
            className="bg-destructive hover:opacity-90 text-white font-bold active:scale-95 transition-all cursor-pointer"
          >
            {leaveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Leaving...
              </>
            ) : (
              'Yes, Leave Space'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
