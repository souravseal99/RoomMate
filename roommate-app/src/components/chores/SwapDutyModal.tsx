import { useState } from 'react';
import { ArrowLeftRight } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface SwapDutyModalProps {
  open: boolean;
  chore: ChoreItem | null;
  onClose: () => void;
  onConfirmSwap: (chore: ChoreItem, targetFlatmateName: string) => void;
}

const SWAP_CANDIDATES = [
  { name: 'Sarah Lin', initials: 'SL', role: 'Coffee Station' },
  { name: 'Leo Keller', initials: 'LK', role: 'Entryway' },
  { name: 'Alex Chen', initials: 'AC', role: 'Compost & Boxes' },
];

export function SwapDutyModal({ open, chore, onClose, onConfirmSwap }: SwapDutyModalProps) {
  const [selectedTarget, setSelectedTarget] = useState('Sarah Lin');

  if (!chore) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSwap(chore, selectedTarget);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl border-border flex flex-col gap-4">
        {/* Header */}
        <DialogHeader className="p-0 border-b border-border/50 pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
            </span>
            <div>
              <DialogTitle className="font-display font-bold text-base sm:text-lg text-foreground">
                Propose Duty Swap
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Ask a flatmate to swap for:{' '}
                <strong className="text-foreground font-semibold">{chore.description}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Flatmate Selection Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Select Flatmate to Swap With
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SWAP_CANDIDATES.map((cand) => {
              const isSelected = selectedTarget === cand.name;
              return (
                <Button
                  key={cand.name}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  onClick={() => setSelectedTarget(cand.name)}
                  className={`p-3 min-h-[72px] rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer h-auto ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container border-border/50 text-foreground'
                  }`}
                >
                  <Avatar className="w-8 h-8 shrink-0">
                    <AvatarFallback
                      className={`text-xs font-bold ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-container text-muted-foreground'
                      }`}
                    >
                      {cand.initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs truncate max-w-full">{cand.name}</span>
                </Button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="flex flex-row items-center justify-end gap-2 pt-2 border-t border-border/50 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="px-4 min-h-[44px] rounded-xl bg-surface-container text-foreground font-semibold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            className="px-5 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Send Request ⇄
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default SwapDutyModal;
