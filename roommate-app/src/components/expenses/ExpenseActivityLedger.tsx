import { useState } from 'react';
import { Receipt, Search } from 'lucide-react';
import { ExpenseActivityItem } from './ExpenseActivityItem';
import { Input } from '@/components/ui/input';
import type { ExpenseResponse } from '@/types/expenseTypes';

interface ExpenseActivityLedgerProps {
  expenses: ExpenseResponse[];
  currentUserId: string | null;
  onDeleteExpense: (expenseId: string) => void;
  deletingExpenseId?: string | null;
}

export function ExpenseActivityLedger({
  expenses,
  currentUserId,
  onDeleteExpense,
  deletingExpenseId,
}: ExpenseActivityLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAll, setShowAll] = useState(false);

  const filteredExpenses = expenses.filter((expense) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      expense.description.toLowerCase().includes(q) ||
      expense.paidBy?.name?.toLowerCase().includes(q) ||
      expense.category?.toLowerCase().includes(q)
    );
  });

  const displayedExpenses = showAll ? filteredExpenses : filteredExpenses.slice(0, 8);

  return (
    <section className="w-full space-y-3 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          Recent Activity
        </h3>

        <div className="flex items-center gap-3">
          {expenses.length > 5 && (
            <div className="relative w-full sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 pl-8 text-xs bg-surface-container-lowest border-border"
              />
            </div>
          )}

          {expenses.length > 8 && !searchQuery && (
            <button
              type="button"
              onClick={() => setShowAll((prev) => !prev)}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer shrink-0"
            >
              {showAll ? 'Show Less' : `View All (${expenses.length})`}
            </button>
          )}
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl border border-border shadow-xs overflow-hidden">
        {displayedExpenses.length > 0 ? (
          <div className="divide-y divide-border/40">
            {displayedExpenses.map((expense) => (
              <ExpenseActivityItem
                key={expense.expenseId}
                expense={expense}
                currentUserId={currentUserId}
                onDelete={onDeleteExpense}
                isDeleting={deletingExpenseId === expense.expenseId}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center text-muted-foreground border border-border">
              <Receipt className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">
              {searchQuery ? 'No matching expenses found' : 'No expenses recorded yet'}
            </p>
            <p className="text-xs text-muted-foreground max-w-xs">
              {searchQuery
                ? 'Try searching with a different term.'
                : 'Log your first shared apartment expense to split bills fairly.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
