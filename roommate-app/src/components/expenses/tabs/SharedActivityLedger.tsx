import { useState, useMemo } from 'react';
import { Search, Trash2, Loader2 } from 'lucide-react';
import type { ExpenseResponse } from '@/types/expenseTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface SharedActivityLedgerProps {
  expenses: ExpenseResponse[];
  currentUserId: string;
  onDeleteExpense: (expenseId: string) => void;
  deletingExpenseId?: string | null;
}

export function SharedActivityLedger({
  expenses,
  currentUserId,
  onDeleteExpense,
  deletingExpenseId,
}: SharedActivityLedgerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<
    'All' | 'Groceries' | 'Utilities' | 'Supplies'
  >('All');

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const payerName = expense.paidBy?.name || 'Unknown';
      const matchesSearch =
        expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payerName.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedFilter === 'Groceries') {
        return (
          expense.description.toLowerCase().includes('grocer') ||
          expense.description.toLowerCase().includes('food') ||
          expense.description.toLowerCase().includes('trader')
        );
      }
      if (selectedFilter === 'Utilities') {
        return (
          expense.description.toLowerCase().includes('util') ||
          expense.description.toLowerCase().includes('wi-fi') ||
          expense.description.toLowerCase().includes('electric')
        );
      }
      if (selectedFilter === 'Supplies') {
        return (
          expense.description.toLowerCase().includes('supply') ||
          expense.description.toLowerCase().includes('clean') ||
          expense.description.toLowerCase().includes('coffee')
        );
      }

      return true;
    });
  }, [expenses, searchQuery, selectedFilter]);

  return (
    <Card className="w-full bg-card rounded-2xl shadow-xs p-5 sm:p-6 border-border space-y-4 select-none">
      {/* Header and Controls */}
      <CardHeader className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-2 border-b border-border/40 space-y-0">
        <div>
          <div className="flex items-center gap-2">
            <CardTitle className="font-display font-extrabold text-lg text-foreground">
              Shared Activity Ledger
            </CardTitle>
            <Badge
              variant="outline"
              className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold border-primary/20"
            >
              {filteredExpenses.length} Records
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Chronological communal spending events with immutable split tracing
          </p>
        </div>

        {/* Search & Category Filter Pills */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts..."
              className="w-full sm:w-48 pl-9 pr-3 min-h-[44px] bg-surface-container text-foreground rounded-lg font-mono text-xs border-border/50"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {(['All', 'Groceries', 'Utilities', 'Supplies'] as const).map((filter) => {
              const isActive = selectedFilter === filter;
              return (
                <Button
                  key={filter}
                  type="button"
                  variant={isActive ? 'default' : 'outline'}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 min-h-[44px] rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer h-auto py-1.5 ${
                    isActive
                      ? 'bg-foreground text-background shadow-xs font-bold'
                      : 'bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  {filter === 'Groceries'
                    ? '🛒 Groceries'
                    : filter === 'Utilities'
                      ? '⚡ Utilities'
                      : filter === 'Supplies'
                        ? '🧻 Supplies'
                        : 'All'}
                </Button>
              );
            })}
          </div>
        </div>
      </CardHeader>

      {/* Transactions Table / List */}
      <CardContent className="p-0">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 text-center text-muted-foreground text-xs space-y-1">
            <p className="font-semibold text-foreground">No matching expenses found</p>
            <p>Try clearing your search query or log a new bill using the dock above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40 overflow-hidden">
            {filteredExpenses.map((expense) => {
              const isPayer = expense.paidById === currentUserId;
              const payerName = isPayer ? 'You' : expense.paidBy?.name || 'Unknown';
              const splitCount = expense.splits?.length || 4;
              const perPersonShare = (expense.amount / splitCount).toFixed(2);
              const formattedDate = new Date(expense.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              });
              const isDeleting = deletingExpenseId === expense.expenseId;

              return (
                <div
                  key={expense.expenseId}
                  className="py-3 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container/50 rounded-xl transition-colors group"
                >
                  {/* Left: Payer avatar, description, metadata */}
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="w-10 h-10 shrink-0">
                      <AvatarFallback
                        className={`font-bold text-xs shadow-xs ${
                          isPayer
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-surface-container-high text-foreground'
                        }`}
                      >
                        {(payerName[0] || 'U').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-foreground truncate">
                          {expense.description}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium pt-0.5">
                        <span>
                          Paid by <strong className="text-foreground">{payerName}</strong>
                        </span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span className="font-mono text-primary font-semibold">
                          Split {splitCount}-ways (${perPersonShare} ea)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount and Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pl-13 sm:pl-0">
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-base text-foreground tabular-nums">
                        ${expense.amount.toFixed(2)}
                      </div>
                      <span className="text-[10px] font-mono text-muted-foreground uppercase">
                        {isPayer ? 'You paid total' : `Your share: $${perPersonShare}`}
                      </span>
                    </div>

                    {/* Delete action button */}
                    {isPayer && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove expense"
                        onClick={() => onDeleteExpense(expense.expenseId)}
                        disabled={isDeleting}
                        className="min-h-[44px] min-w-[44px] rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {isDeleting ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SharedActivityLedger;
