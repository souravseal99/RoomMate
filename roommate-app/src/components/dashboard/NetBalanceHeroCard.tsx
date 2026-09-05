import { Wallet, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import type { RecentExpenseActivity } from '@/types/dashboardTypes';

interface Props {
  expensesAmount: number;
  recentExpenses: RecentExpenseActivity[];
}

export default function NetBalanceHeroCard({ expensesAmount, recentExpenses }: Props) {
  const navigate = useNavigate();

  const isOwed = expensesAmount > 0;
  const isZero = expensesAmount === 0;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-card border border-border p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Balance Top Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Net Balance
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-primary mt-1">
            {isZero ? (
              'All Settled Up ✨'
            ) : isOwed ? (
              <>
                You're owed <br />
                <span className="text-primary">${expensesAmount.toFixed(2)}</span>
              </>
            ) : (
              <>
                You owe <br />
                <span className="text-destructive">${Math.abs(expensesAmount).toFixed(2)}</span>
              </>
            )}
          </h2>
        </div>
        <div className="bg-primary/10 p-3 rounded-xl">
          <Wallet className="w-7 h-7 text-primary" />
        </div>
      </div>

      {/* Breakdown List */}
      {recentExpenses && recentExpenses.length > 0 && (
        <div className="space-y-2.5 border-t border-dashed border-border/50 pt-4 mb-6">
          {recentExpenses.slice(0, 2).map((exp) => (
            <div key={exp.id} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {exp.title} ({exp.paidBy})
                </span>
              </div>
              <span className="font-bold text-foreground">${exp.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Settle Up Action CTA */}
      <Button
        type="button"
        onClick={() => navigate('/expenses')}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 h-auto rounded-xl flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-primary/20 cursor-pointer transition-all"
      >
        <CreditCard className="w-5 h-5" />
        Settle Up
      </Button>
    </section>
  );
}
