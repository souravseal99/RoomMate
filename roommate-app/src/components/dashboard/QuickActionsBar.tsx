import { ReceiptText, PlusCircle, ShoppingBag, Banknote, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionsBarProps {
  lowStockCount?: number;
  onOpenSettleModal?: () => void;
}

export function QuickActionsBar({ lowStockCount = 2, onOpenSettleModal }: QuickActionsBarProps) {
  const navigate = useNavigate();

  return (
    <section
      aria-label="1-Tap Living Actions Bar"
      className="w-full bg-card rounded-2xl p-4 shadow-xs border border-border flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 select-none"
    >
      {/* Left Branding Group */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center font-bold shadow-xs">
          <Zap className="w-4 h-4 fill-current" />
        </div>
        <div>
          <p className="font-bold text-sm text-foreground leading-tight tracking-tight font-display">
            Instant Living Actions
          </p>
          <p className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground leading-none mt-0.5 font-mono">
            Tactile quick triggers
          </p>
        </div>
      </div>

      {/* Right Grid: 4 Tactile Action Buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full md:w-auto">
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-[0_2px_0_#9A3412] hover:bg-primary/90 active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim"
        >
          <ReceiptText className="w-4 h-4 stroke-[2.2]" />
          <span>+ Log Expense</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/chores')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-surface-container border border-border text-foreground font-semibold text-xs tracking-tight hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-primary stroke-[2.2]" />
          <span>+ Add Chore</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-surface-container border border-border text-foreground font-semibold text-xs tracking-tight hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer relative"
        >
          <ShoppingBag className="w-4 h-4 text-primary stroke-[2.2]" />
          <span>🛒 Cart ({lowStockCount} Low)</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettleModal || (() => navigate('/expenses'))}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-tertiary text-tertiary-foreground font-semibold text-xs tracking-tight shadow-xs hover:bg-tertiary/90 active:scale-95 transition-all cursor-pointer"
        >
          <Banknote className="w-4 h-4 stroke-[2.2]" />
          <span>⚡ Settle Debt</span>
        </button>
      </div>
    </section>
  );
}

export default QuickActionsBar;
