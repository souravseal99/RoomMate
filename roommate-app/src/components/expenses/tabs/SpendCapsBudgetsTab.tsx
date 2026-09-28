import { AlertTriangle, SunMedium, ArrowUpRight } from 'lucide-react';
import type { ExpenseResponse } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';

interface SpendCapsBudgetsTabProps {
  expenses: ExpenseResponse[];
  householdMembers: HouseholdMember[];
  onOpenSundaySquareUp: () => void;
}

export function SpendCapsBudgetsTab({
  expenses,
  householdMembers,
  onOpenSundaySquareUp,
}: SpendCapsBudgetsTabProps) {
  const memberCount = Math.max(1, householdMembers.length);

  // Dynamic budget calculations
  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0) || 1420;
  const perTenantShare = totalSpent / memberCount;

  const budgetCategories = [
    {
      category: 'Food & Groceries',
      emoji: '🛒',
      spent: 680,
      cap: 800,
      color: 'bg-primary',
    },
    {
      category: 'Power, Gas & Wi-Fi',
      emoji: '⚡',
      spent: 285,
      cap: 400,
      color: 'bg-secondary',
    },
    {
      category: 'Communal Cleaning & Supplies',
      emoji: '🧻',
      spent: 145,
      cap: 250,
      color: 'bg-amber-600',
    },
    {
      category: 'Maintenance & Staples Fund',
      emoji: '🛠️',
      spent: 60,
      cap: 150,
      color: 'bg-emerald-600',
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 select-none">
      {/* 1. Header Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Monthly Shared Outlay
          </span>
          <div className="font-display font-extrabold text-2xl text-foreground font-mono tabular-nums">
            ${totalSpent.toFixed(2)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Combined spend across {memberCount} flatmates
          </span>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Fair Share Target
          </span>
          <div className="font-display font-extrabold text-2xl text-primary font-mono tabular-nums">
            ${perTenantShare.toFixed(2)}
          </div>
          <span className="text-[11px] text-muted-foreground">
            Per-tenant equalized domestic quota
          </span>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border shadow-xs space-y-1">
          <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Cap Health
          </span>
          <div className="font-display font-extrabold text-2xl text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            78% Utilized
          </div>
          <span className="text-[11px] text-muted-foreground">
            $380 buffer remaining in cycle
          </span>
        </div>
      </div>

      {/* 2. Category Budget Progress Meters */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40">
          <div>
            <h3 className="font-display font-extrabold text-lg text-foreground">
              Category Spend Allocations
            </h3>
            <p className="text-xs text-muted-foreground">
              Progress against monthly flatmate expenditure thresholds
            </p>
          </div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-surface-container border border-border/50 text-foreground">
            Cycle Cap: $1,600.00
          </span>
        </div>

        <div className="space-y-4">
          {budgetCategories.map((cat) => {
            const percentage = Math.min(100, Math.round((cat.spent / cat.cap) * 100));
            const isNearCap = percentage >= 85;

            return (
              <div key={cat.category} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{cat.emoji}</span>
                    <span className="font-bold text-foreground">{cat.category}</span>
                    {isNearCap && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded">
                        <AlertTriangle className="w-3 h-3" /> 85%+ Target
                      </span>
                    )}
                  </div>
                  <div className="font-mono tabular-nums text-foreground font-bold">
                    ${cat.spent}{' '}
                    <span className="text-muted-foreground font-normal">
                      / ${cat.cap} ({percentage}%)
                    </span>
                  </div>
                </div>

                <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`${cat.color} h-full rounded-full transition-all`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Sunday Square-Up Protocol Card */}
      <div className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <SunMedium className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">
              Sunday Square-Up Protocol Active
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every Sunday at 11:59 PM, all balanced ledger records are consolidated and archived to keep the active feed crisp and zero-friction.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSundaySquareUp}
          className="px-4 py-2 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm border-b-2 border-primary-fixed-dim transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
        >
          <span>Trigger Early Square-Up</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
