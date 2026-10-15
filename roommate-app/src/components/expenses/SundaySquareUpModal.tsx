import { RefreshCw, ShieldCheck, SunMedium } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SundaySquareUpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  householdName: string;
}

export function SundaySquareUpModal({
  open,
  onOpenChange,
  householdName,
}: SundaySquareUpModalProps) {
  const handleConfirm = () => {
    toast.success(
      'Sunday Square-Up completed: All settled domestic balances have been consolidated and archived! 🎉'
    );
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border border-border shadow-xl p-6 rounded-2xl select-none">
        <DialogHeader className="space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <SunMedium className="w-6 h-6 stroke-[2.2]" />
          </div>
          <DialogTitle className="font-display font-extrabold text-xl text-foreground">
            Sunday Square-Up Protocol
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Weekly automated domestic reconciliation for{' '}
            <strong className="text-foreground">{householdName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 text-xs">
          <div className="p-3.5 bg-surface-container rounded-xl border border-border/50 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Zero-Friction Consolidation</span>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Square-Up rolls over fixed utilities into the new cycle, archives fully settled transactions, and generates an immutable ledger snapshot for flatmate peace of mind.
            </p>
          </div>

          <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 space-y-1">
            <div className="flex justify-between font-mono font-bold text-[11px]">
              <span className="text-muted-foreground">ACTIVE CYCLE:</span>
              <span className="text-primary">OCTOBER 2024</span>
            </div>
            <div className="flex justify-between font-mono font-bold text-[11px]">
              <span className="text-muted-foreground">CURRENT STATUS:</span>
              <span className="text-emerald-600 dark:text-emerald-400">ALL BALANCES SQUARE</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="min-h-[44px] rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleConfirm}
            className="min-h-[44px] bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs rounded-xl shadow-sm border-b-2 border-primary-fixed-dim cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            <span>Confirm & Consolidate</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
