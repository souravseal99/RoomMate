import { useState, useEffect } from 'react';
import { CreditCard, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateSettlementMutation } from '@/hooks/queries/useExpenseQueries';
import { toast } from 'sonner';
import type { HouseholdMember } from '@/types/householdTypes';
import type { OptimizedSettlement } from '@/types/expenseTypes';

interface QuickSettleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdId: string;
  householdMembers: HouseholdMember[];
  currentUserId: string | null;
  initialSettlement?: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  } | null;
  pendingSettlements?: OptimizedSettlement[];
}

export function QuickSettleModal({
  open,
  onOpenChange,
  householdId,
  householdMembers,
  currentUserId,
  initialSettlement,
  pendingSettlements = [],
}: QuickSettleModalProps) {
  const createSettlementMutation = useCreateSettlementMutation();

  const [toUserId, setToUserId] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);

  useEffect(() => {
    if (open) {
      if (initialSettlement) {
        setToUserId(initialSettlement.toUserId);
        setAmount(initialSettlement.amount);
      } else if (pendingSettlements.length > 0) {
        // Default to first pending debt current user owes
        const userDebt = pendingSettlements.find((s) => s.fromUserId === currentUserId);
        if (userDebt) {
          setToUserId(userDebt.toUserId);
          setAmount(userDebt.amount);
        } else {
          const firstOther = householdMembers.find(
            (m) => (m.userId || m.householdMemberId) !== currentUserId
          );
          setToUserId(firstOther?.userId || firstOther?.householdMemberId || '');
          setAmount(0);
        }
      }
    }
  }, [open, initialSettlement, pendingSettlements, currentUserId, householdMembers]);

  const targetMember = householdMembers.find(
    (m) => (m.userId || m.householdMemberId) === toUserId
  );
  const payeeName = targetMember?.user?.name || initialSettlement?.toName || 'Roommate';

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!householdId || !currentUserId || !toUserId || amount <= 0) {
      toast.error('Please specify a valid amount and recipient');
      return;
    }

    try {
      await createSettlementMutation.mutateAsync({
        fromUserId: currentUserId,
        toUserId: toUserId,
        householdId: householdId,
        amount: Number(amount),
      });

      toast.success(`Settlement recorded! You and ${payeeName} are all square 🎉`);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Failed to record settlement:', error);
      toast.error(error?.response?.data?.message || 'Failed to record settlement');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-sm p-6">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Settle Up Balance
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleConfirm} className="space-y-4 pt-1">
          {/* Transfer Visual Direction */}
          <div className="p-3.5 bg-surface-container rounded-xl flex items-center justify-between border border-border/60">
            <div className="text-center flex-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">From</span>
              <p className="text-xs font-bold text-foreground truncate">You</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shrink-0">
              <ArrowRight className="w-4 h-4" />
            </div>
            <div className="text-center flex-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground">To</span>
              <p className="text-xs font-bold text-foreground truncate">{payeeName}</p>
            </div>
          </div>

          {/* Recipient Dropdown */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Pay Roommate
            </Label>
            <Select value={toUserId} onValueChange={(val) => setToUserId(val)}>
              <SelectTrigger className="w-full bg-surface-container-low border-input text-xs">
                <SelectValue placeholder="Select roommate to pay" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {householdMembers
                  .filter((m) => (m.userId || m.householdMemberId) !== currentUserId)
                  .map((member) => {
                    const mId = member.userId || member.householdMemberId;
                    return (
                      <SelectItem key={mId} value={mId} className="text-xs cursor-pointer">
                        {member.user?.name || 'Roommate'}
                      </SelectItem>
                    );
                  })}
              </SelectContent>
            </Select>
          </div>

          {/* Amount Field */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Settlement Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-lg font-bold text-muted-foreground">
                ₹
              </span>
              <Input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="pl-8 text-xl font-extrabold bg-surface-container-low border-input text-foreground h-12 focus-visible:ring-primary"
                required
              />
            </div>
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 flex-row gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-border text-foreground font-semibold text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createSettlementMutation.isPending || amount <= 0 || !toUserId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-5 cursor-pointer shadow-xs active:scale-98"
            >
              {createSettlementMutation.isPending ? 'Recording...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
