import { ShoppingCart, CheckSquare, Package, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  lowStockCount?: number;
}

export default function QuickActionsBar({ lowStockCount = 0 }: Props) {
  const navigate = useNavigate();

  return (
    <section className="grid grid-cols-4 gap-3 py-1">
      {/* 1. Log Expense */}
      <button
        type="button"
        onClick={() => navigate('/expenses')}
        className="flex flex-col items-center gap-2 active:scale-95 hover:-translate-y-0.5 transition-all cursor-pointer group"
      >
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/20 group-hover:bg-primary/90 transition-colors">
          <ShoppingCart className="w-6 h-6 sm:w-7 sm:h-7" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground text-center leading-tight">
          Log Expense
        </span>
      </button>

      {/* 2. New Chore */}
      <button
        type="button"
        onClick={() => navigate('/chores')}
        className="flex flex-col items-center gap-2 active:scale-95 hover:-translate-y-0.5 transition-all cursor-pointer group"
      >
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:bg-surface-container transition-colors">
          <CheckSquare className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground text-center leading-tight">
          New Chore
        </span>
      </button>

      {/* 3. Restock */}
      <button
        type="button"
        onClick={() => navigate('/inventory')}
        className="flex flex-col items-center gap-2 active:scale-95 relative hover:-translate-y-0.5 transition-all cursor-pointer group"
      >
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:bg-surface-container transition-colors">
          <Package className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground text-center leading-tight">
          Restock
        </span>
        {lowStockCount > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-destructive rounded-full border-2 border-background flex items-center justify-center shadow-xs">
            <span className="text-[10px] font-bold text-white leading-none">
              {lowStockCount}
            </span>
          </div>
        )}
      </button>

      {/* 4. Announce */}
      <button
        type="button"
        onClick={() => navigate('/households')}
        className="flex flex-col items-center gap-2 active:scale-95 hover:-translate-y-0.5 transition-all cursor-pointer group"
      >
        <div className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-card border border-border flex items-center justify-center group-hover:bg-surface-container transition-colors">
          <Megaphone className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-tight text-muted-foreground text-center leading-tight">
          Announce
        </span>
      </button>
    </section>
  );
}
