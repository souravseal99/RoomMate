import { ReceiptText, PlusCircle, ShoppingBag, Banknote } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface QuickActionsBarProps {
  lowStockCount?: number;
  debtAmount?: number;
  onOpenSettleModal?: () => void;
}

export function QuickActionsBar({
  lowStockCount = 2,
  debtAmount = 15.0,
  onOpenSettleModal,
}: QuickActionsBarProps) {
  const navigate = useNavigate();

  return (
    <nav aria-label="Quick Living Actions Ribbon" className="w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3 w-full">
        {/* Action 1: Log Expense */}
        <Card
          onClick={() => navigate('/expenses')}
          className="group cursor-pointer bg-card hover:bg-surface-container border-border/80 hover:border-primary/40 rounded-2xl shadow-xs transition-all active:scale-[0.98] select-none"
        >
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3 min-h-[56px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <ReceiptText className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-tight font-display">
                Log Expense
              </p>
              <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5 truncate">
                Split 4 ways
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action 2: Add Chore */}
        <Card
          onClick={() => navigate('/chores')}
          className="group cursor-pointer bg-card hover:bg-surface-container border-border/80 hover:border-border rounded-2xl shadow-xs transition-all active:scale-[0.98] select-none"
        >
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3 min-h-[56px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container border border-border text-foreground flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 text-primary stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-tight font-display">
                Add Chore
              </p>
              <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5 truncate">
                Post to Rota
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action 3: Shopping Cart */}
        <Card
          onClick={() => navigate('/inventory')}
          className="group cursor-pointer bg-card hover:bg-surface-container border-border/80 hover:border-border rounded-2xl shadow-xs transition-all active:scale-[0.98] select-none"
        >
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3 min-h-[56px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface-container border border-border text-foreground flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-primary stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-tight font-display">
                Shopping Cart
              </p>
              <p className="text-[11px] text-destructive dark:text-terracotta font-mono font-medium leading-tight mt-0.5 truncate">
                {lowStockCount} {lowStockCount === 1 ? 'item' : 'items'} low
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action 4: Settle Balance */}
        <Card
          onClick={onOpenSettleModal || (() => navigate('/expenses'))}
          className="group cursor-pointer bg-card hover:bg-surface-container border-border/80 hover:border-border rounded-2xl shadow-xs transition-all active:scale-[0.98] select-none"
        >
          <CardContent className="p-3.5 sm:p-4 flex items-center gap-3 min-h-[56px]">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-tertiary text-tertiary-foreground flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <Banknote className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight leading-tight font-display">
                Settle Balance
              </p>
              <p className="text-[11px] text-muted-foreground font-mono leading-tight mt-0.5 truncate tabular-nums">
                ${debtAmount.toFixed(2)} owed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </nav>
  );
}

export default QuickActionsBar;
