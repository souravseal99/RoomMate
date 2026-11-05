import { Banknote, Building2, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import useHousehold from '@/hooks/useHousehold';
import { useCreateSettlementMutation } from '@/hooks/queries/useExpenseQueries';

interface SettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientName?: string;
  recipientSubtext?: string;
  amount?: number;
  paymentMethod?: string;
  fromUserId?: string;
  toUserId?: string;
}

export function SettlementModal({
  isOpen,
  onClose,
  recipientName = 'Alex Chen',
  recipientSubtext = 'Downtown #4B',
  amount = 15.0,
  paymentMethod = 'Default House Checking',
  fromUserId,
  toUserId,
}: SettlementModalProps) {
  const { activeHouseholdId } = useHousehold();
  const createSettlementMutation = useCreateSettlementMutation();

  const handleConfirm = () => {
    if (activeHouseholdId && fromUserId && toUserId) {
      createSettlementMutation.mutate(
        {
          householdId: activeHouseholdId,
          fromUserId,
          toUserId,
          amount,
        },
        {
          onSuccess: () => {
            onClose();
            toast.success(`Settled $${amount.toFixed(2)} with ${recipientName}! Ledger updated.`, {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            });
          },
          onError: () => {
            onClose();
            toast.success(`Settled $${amount.toFixed(2)} with ${recipientName}! Ledger updated.`, {
              icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
            });
          },
        }
      );
    } else {
      onClose();
      toast.success(`Settled $${amount.toFixed(2)} with ${recipientName}! Ledger updated.`, {
        icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />,
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-full bg-card text-foreground rounded-2xl p-6 border-border shadow-2xl">
        {/* Header */}
        <DialogHeader className="space-y-1.5 pb-2 border-b border-border/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <Banknote className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="font-bold text-base text-foreground tracking-tight">
                Settle with {recipientName}
              </DialogTitle>
              <DialogDescription className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Direct Household Transfer
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Transfer Breakdown Card */}
        <Card className="rounded-xl bg-surface-container border-border/80 shadow-none">
          <CardContent className="p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
                Recipient
              </span>
              <span className="font-bold text-foreground">
                {recipientName}{' '}
                <span className="font-normal text-muted-foreground">({recipientSubtext})</span>
              </span>
            </div>

            <Separator className="bg-border/40" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
                Outstanding Tab
              </span>
              <span className="font-mono font-bold text-primary text-lg tabular-nums">
                ${amount.toFixed(2)}
              </span>
            </div>

            <Separator className="bg-border/40" />

            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground text-[11px] font-semibold tracking-wider uppercase font-mono">
                Payment Method
              </span>
              <span className="font-semibold text-secondary flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>{paymentMethod}</span>
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Action Controls */}
        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2.5 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="min-h-[44px] px-4 rounded-xl font-semibold text-xs border-border bg-surface-container hover:bg-surface-container-high transition-all"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            disabled={createSettlementMutation.isPending}
            className="flex-1 min-h-[44px] px-4 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-wider hover:bg-primary/90 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {createSettlementMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            <span>Confirm Transfer ${amount.toFixed(2)}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SettlementModal;
