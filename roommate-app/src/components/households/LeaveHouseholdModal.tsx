import { useState } from 'react';
import { AlertTriangle, Loader2, LogOut, DollarSign, CheckSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
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
import { useExpenseBalancesQuery } from '@/hooks/queries/useExpenseQueries';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { getCurrentUserId } from '@/utils/jwt';
import { useToast } from '@/hooks/use-toast';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function LeaveHouseholdModal({ household, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const leaveMutation = useLeaveHouseholdMutation();
  const [acknowledged, setAcknowledged] = useState(false);

  // Pre-departure audit
  const currentUserId = getCurrentUserId();
  const { data: balancesData } = useExpenseBalancesQuery(household.householdId);
  const { data: chores = [] } = useHouseholdChoresQuery(household.householdId);

  const userBalance = balancesData?.balances?.find((b) => b.userId === currentUserId)?.balance ?? 0;
  const userOwesMoney = userBalance < -0.01;
  const userIsOwedMoney = userBalance > 0.01;

  const assignedChores = chores.filter(
    (c) => !(c.completed || (c as any).isCompleted) && c.assignedToId === currentUserId
  );
  const hasPendingChores = assignedChores.length > 0;
  const hasAuditFlags = userOwesMoney || userIsOwedMoney || hasPendingChores;

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

  const handleGoToExpenses = () => {
    onOpenChange(false);
    navigate('/expenses');
  };

  const handleGoToChores = () => {
    onOpenChange(false);
    navigate('/chores');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border border-border max-w-md p-0 overflow-hidden shadow-xl rounded-2xl max-h-[90vh] overflow-y-auto select-none">
        <DialogHeader className="p-6 bg-surface-container border-b border-border/60">
          <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <LogOut className="w-5 h-5 text-destructive" />
            <span>Leave Household?</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Are you sure you want to leave{' '}
            <strong className="text-foreground">{household.name}</strong>?
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 space-y-4">
          {/* Pre-Departure Audit Box */}
          {hasAuditFlags && (
            <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-xl space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider font-mono">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Pre-Departure Audit Notice</span>
              </div>

              {/* Debt / Credit alert */}
              {userOwesMoney && (
                <div className="flex items-center justify-between text-xs bg-card p-2.5 rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-destructive shrink-0" />
                    <span>
                      You owe{' '}
                      <strong className="font-mono tabular-nums text-destructive">
                        ${Math.abs(userBalance).toFixed(2)}
                      </strong>{' '}
                      to flatmates
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleGoToExpenses}
                    className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 p-0 h-auto"
                  >
                    <span>Settle Now</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {userIsOwedMoney && (
                <div className="flex items-center justify-between text-xs bg-card p-2.5 rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Flatmates owe you{' '}
                      <strong className="font-mono tabular-nums text-emerald-600">
                        ${userBalance.toFixed(2)}
                      </strong>
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleGoToExpenses}
                    className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 p-0 h-auto"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Chores alert */}
              {hasPendingChores && (
                <div className="flex items-center justify-between text-xs bg-card p-2.5 rounded-lg border border-border/60">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong className="font-mono tabular-nums">{assignedChores.length}</strong>{' '}
                      active chore{assignedChores.length > 1 ? 's' : ''} assigned to you
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handleGoToChores}
                    className="text-primary hover:underline font-bold text-[11px] flex items-center gap-1 cursor-pointer shrink-0 p-0 h-auto"
                  >
                    <span>Reassign</span>
                    <ArrowRight className="w-3 h-3" />
                  </Button>
                </div>
              )}

              {/* Acknowledgment Checkbox */}
              <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                />
                <span>I understand my pending obligations will remain in this space.</span>
              </label>
            </div>
          )}

          <div className="bg-surface-container border border-border p-3.5 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
            <div className="text-xs text-muted-foreground space-y-1.5">
              <p className="font-bold text-foreground">What happens next:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>You will lose access to all shared expenses, chores, and inventory.</li>
                <li>Your historical transactions will remain visible in the ledger.</li>
                <li>You will need an active invite code to rejoin this space.</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-surface-container-high/30 border-t border-border/60 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={leaveMutation.isPending}
            className="min-h-[44px] bg-surface border-border hover:bg-surface-container text-foreground cursor-pointer rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
            disabled={leaveMutation.isPending || (hasAuditFlags && !acknowledged)}
            className="min-h-[44px] bg-destructive hover:opacity-90 text-white font-bold active:scale-95 transition-all cursor-pointer disabled:opacity-50 rounded-xl"
          >
            {leaveMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Leaving...</span>
              </>
            ) : (
              <span>Yes, Leave Space</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
