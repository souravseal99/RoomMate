import { useState } from 'react';
import { ArrowLeftRight, X } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';

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

export function SwapDutyModal({
  open,
  chore,
  onClose,
  onConfirmSwap,
}: SwapDutyModalProps) {
  const [selectedTarget, setSelectedTarget] = useState('Sarah Lin');

  if (!open || !chore) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirmSwap(chore, selectedTarget);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-card rounded-2xl p-6 shadow-xl border border-border flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.2]" />
            </span>
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
              Propose Duty Swap
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground">
          Ask a flatmate to swap for:{' '}
          <strong className="text-foreground font-semibold">
            {chore.description}
          </strong>
        </p>

        {/* Flatmate Selection Grid */}
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
            Select Flatmate to Swap With
          </span>
          <div className="grid grid-cols-3 gap-2">
            {SWAP_CANDIDATES.map((cand) => {
              const isSelected = selectedTarget === cand.name;
              return (
                <button
                  key={cand.name}
                  type="button"
                  onClick={() => setSelectedTarget(cand.name)}
                  className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-primary/10 border-primary text-primary font-bold shadow-xs'
                      : 'bg-surface-container-low hover:bg-surface-container border-border/50 text-foreground'
                  }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-muted-foreground'
                  }`}>
                    {cand.initials}
                  </span>
                  <span className="text-xs">{cand.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 min-h-[44px] rounded-xl bg-surface-container text-foreground font-semibold text-xs hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Send Request ⇄
          </button>
        </div>
      </div>
    </div>
  );
}
