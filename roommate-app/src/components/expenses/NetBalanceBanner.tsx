import { ArrowUpRight, ArrowDownLeft, Check, Wallet } from 'lucide-react';
import { formatCurrency } from '@/utils/utils';
import { Button } from '@/components/ui/button';

interface NetBalanceBannerProps {
  netBalance: number;
  onQuickSettle: () => void;
  hasPendingDebts: boolean;
}

export function NetBalanceBanner({
  netBalance,
  onQuickSettle,
  hasPendingDebts,
}: NetBalanceBannerProps) {
  const isPositive = netBalance > 0.01;
  const isNegative = netBalance < -0.01;
  const isZero = !isPositive && !isNegative;

  // Calculate circumference offset for circular meter (circumference = 2 * PI * 40 ~= 251.2)
  const maxScale = 5000;
  const progressRatio = Math.min(Math.abs(netBalance) / maxScale, 1);
  const strokeDashoffset = isZero
    ? 0
    : Math.max(251.2 * (1 - Math.max(progressRatio, 0.25)), 0);

  return (
    <section className="w-full">
      <div className="bg-surface-container-lowest rounded-xl p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border border-border shadow-xs relative overflow-hidden">
        <div className="flex items-center gap-4 sm:gap-5">
          {/* Progress Ring Meter */}
          <div className="relative w-20 h-20 sm:w-[84px] sm:h-[84px] flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background Track */}
              <circle
                className="text-surface-container-high"
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeWidth="8"
              />
              {/* Active Progress Track */}
              <circle
                className={
                  isPositive
                    ? 'text-primary'
                    : isNegative
                      ? 'text-destructive'
                      : 'text-primary/40'
                }
                cx="50"
                cy="50"
                fill="none"
                r="40"
                stroke="currentColor"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              {isPositive && <ArrowUpRight className="w-6 h-6 text-primary stroke-[2.5]" />}
              {isNegative && <ArrowDownLeft className="w-6 h-6 text-destructive stroke-[2.5]" />}
              {isZero && <Check className="w-6 h-6 text-muted-foreground stroke-[2.5]" />}
            </div>
          </div>

          {/* Balance Details */}
          <div className="flex flex-col justify-center">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Net Position
            </span>
            <p className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight mt-0.5">
              {isPositive ? `+${formatCurrency(netBalance)}` : formatCurrency(netBalance)}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {isPositive && 'Net Owed to You'}
              {isNegative && 'Net You Owe Flatmates'}
              {isZero && 'All settled up! No debts pending ✨'}
            </p>
          </div>
        </div>

        {/* Action Button */}
        <Button
          onClick={onQuickSettle}
          disabled={!hasPendingDebts}
          className={`w-full md:w-auto h-11 px-5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-transform active:scale-98 shadow-xs ${
            hasPendingDebts
              ? 'bg-primary hover:bg-primary/90 text-primary-foreground'
              : 'bg-surface-container text-muted-foreground border border-border'
          }`}
        >
          <Wallet className="w-4 h-4" />
          {hasPendingDebts ? 'Settle Debts' : 'All Square'}
        </Button>
      </div>
    </section>
  );
}
