import { SunMedium } from 'lucide-react';
import type { ExpenseResponse } from '@/types/expenseTypes';

interface MonthlySharedCeilingCardProps {
  expenses: ExpenseResponse[];
}

export function MonthlySharedCeilingCard({
  expenses,
}: MonthlySharedCeilingCardProps) {
  // Derive category totals dynamically from expenses or fallback to Stitch demo baseline
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const displayTotal = totalSpent > 0 ? totalSpent : 1420;
  const budgetCap = 1800;
  const remaining = Math.max(0, budgetCap - displayTotal);
  const percentage = Math.min(100, Math.round((displayTotal / budgetCap) * 100));

  // Compute breakdown proportions
  const groceriesTotal = expenses
    .filter((e) => e.description.toLowerCase().includes('grocer') || e.description.toLowerCase().includes('food') || e.description.toLowerCase().includes('trader'))
    .reduce((acc, curr) => acc + curr.amount, 0) || 680;

  const utilitiesTotal = expenses
    .filter((e) => e.description.toLowerCase().includes('util') || e.description.toLowerCase().includes('wi-fi') || e.description.toLowerCase().includes('coned') || e.description.toLowerCase().includes('electric'))
    .reduce((acc, curr) => acc + curr.amount, 0) || 285;

  const suppliesTotal = expenses
    .filter((e) => e.description.toLowerCase().includes('supply') || e.description.toLowerCase().includes('clean') || e.description.toLowerCase().includes('coffee'))
    .reduce((acc, curr) => acc + curr.amount, 0) || 145;

  const grocWidth = Math.min(60, Math.round((groceriesTotal / budgetCap) * 100));
  const utilWidth = Math.min(30, Math.round((utilitiesTotal / budgetCap) * 100));
  const suppWidth = Math.min(20, Math.round((suppliesTotal / budgetCap) * 100));

  return (
    <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border border-border flex flex-col justify-between gap-4 select-none">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-border/40">
          <h3 className="font-display font-extrabold text-lg text-foreground">
            Monthly Shared Ceiling
          </h3>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20">
            OCTOBER
          </span>
        </div>

        {/* Spend Metrics */}
        <div className="flex items-baseline justify-between pt-1">
          <div className="flex items-baseline gap-1.5">
            <span className="font-display font-extrabold text-2xl text-foreground font-mono tabular-nums">
              ${displayTotal.toFixed(0)}
            </span>
            <span className="text-xs text-muted-foreground font-mono">
              / ${budgetCap.toFixed(0)} cap ({percentage}%)
            </span>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
            ${remaining.toFixed(0)} left
          </span>
        </div>

        {/* Multi-segment Progress Bar */}
        <div className="w-full h-3 bg-surface-container-high rounded-full overflow-hidden flex shadow-inner gap-0.5">
          <div
            className="bg-primary h-full rounded-l-full transition-all"
            style={{ width: `${grocWidth}%` }}
            title={`Groceries: $${groceriesTotal}`}
          />
          <div
            className="bg-secondary h-full transition-all"
            style={{ width: `${utilWidth}%` }}
            title={`Utilities: $${utilitiesTotal}`}
          />
          <div
            className="bg-amber-600 h-full rounded-r-full transition-all"
            style={{ width: `${suppWidth}%` }}
            title={`Supplies: $${suppliesTotal}`}
          />
        </div>

        {/* Category Legend */}
        <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground font-medium">
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-primary shrink-0" />
            <span className="truncate">Food ${groceriesTotal}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary shrink-0" />
            <span className="truncate">Power ${utilitiesTotal}</span>
          </div>
          <div className="flex items-center gap-1.5 truncate">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 shrink-0" />
            <span className="truncate">Supply ${suppliesTotal}</span>
          </div>
        </div>
      </div>

      {/* Sunday Square-Up Banner Notice */}
      <div className="p-3 bg-primary/5 rounded-xl border border-primary/20 flex items-center gap-2.5">
        <SunMedium className="w-5 h-5 text-primary shrink-0" />
        <p className="text-xs text-foreground leading-snug">
          <strong className="font-bold text-primary">Sunday Square-Up:</strong>{' '}
          Automated domestic debt archive scheduled for Sunday at midnight.
        </p>
      </div>
    </div>
  );
}
