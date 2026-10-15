import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Download,
  ShoppingBag,
  Wifi,
  Coffee,
  Scale,
  Zap,
  Package,
  Receipt,
} from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { useExpensesQuery } from '@/hooks/queries/useExpenseQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FairnessLedgerTabProps {
  onRecordBill?: () => void;
}

export function FairnessLedgerTab({ onRecordBill }: FairnessLedgerTabProps) {
  const navigate = useNavigate();
  const { activeHousehold, activeHouseholdId, householdMembers } = useHousehold();
  const { email, name } = useAuth();
  const { data: expenses = [], isLoading } = useExpensesQuery(activeHouseholdId);

  // Match current user
  const currentMember = useMemo(() => {
    return (
      householdMembers.find(
        (m) =>
          (email && m.user?.email?.toLowerCase() === email.toLowerCase()) ||
          (name && m.user?.name?.toLowerCase() === name.toLowerCase())
      ) || null
    );
  }, [householdMembers, email, name]);

  const currentUserId = currentMember?.userId;
  const currencySymbol = activeHousehold?.settings?.currency === 'EUR' ? '€' : '$';

  // Sort expenses newest first
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [expenses]);

  // Total Communal Spending
  const totalCommunalCost = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Utilities & Groceries Breakdown
  const { utilitiesTotal, staplesTotal } = useMemo(() => {
    let util = 0;
    let staples = 0;
    for (const e of expenses) {
      const cat = (e.category || '').toLowerCase();
      if (cat.includes('util') || cat.includes('electric') || cat.includes('wifi') || cat.includes('gas') || cat.includes('water')) {
        util += e.amount || 0;
      } else if (cat.includes('groc') || cat.includes('pantry') || cat.includes('food') || cat.includes('staple')) {
        staples += e.amount || 0;
      }
    }
    return { utilitiesTotal: util, staplesTotal: staples };
  }, [expenses]);

  // Calculate Fairness Score (0 - 100%)
  const fairnessScore = useMemo(() => {
    if (householdMembers.length <= 1 || expenses.length === 0) return 100;
    const memberCounts = householdMembers.map((m) => {
      return expenses
        .filter(
          (e) =>
            e.paidById === m.userId ||
            e.paidBy?.userId === m.userId ||
            (m.user?.name && e.paidBy?.name?.toLowerCase() === m.user.name.toLowerCase())
        )
        .reduce((sum, e) => sum + (e.amount || 0), 0);
    });

    const target = totalCommunalCost / householdMembers.length;
    if (target === 0) return 100;

    const maxDiff = Math.max(...memberCounts.map((v) => Math.abs(v - target)));
    const variance = maxDiff / target;
    return Math.max(50, Math.min(100, Math.round(100 - variance * 25)));
  }, [householdMembers, expenses, totalCommunalCost]);

  // Category Icon helper
  const getCategoryIcon = (category?: string, description?: string) => {
    const text = `${category || ''} ${description || ''}`.toLowerCase();
    if (text.includes('wifi') || text.includes('internet') || text.includes('fiber')) {
      return <Wifi className="w-3.5 h-3.5" />;
    }
    if (text.includes('coffee') || text.includes('cafe') || text.includes('espresso')) {
      return <Coffee className="w-3.5 h-3.5" />;
    }
    if (text.includes('electric') || text.includes('utility') || text.includes('power') || text.includes('gas')) {
      return <Zap className="w-3.5 h-3.5" />;
    }
    if (text.includes('pantry') || text.includes('paper') || text.includes('cleaning') || text.includes('soap')) {
      return <Package className="w-3.5 h-3.5" />;
    }
    return <ShoppingBag className="w-3.5 h-3.5" />;
  };

  // Real Native CSV Export
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      toast.info('No expenses in ledger to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Category', 'Paid By', 'Amount', 'Currency'];
    const rows = sortedExpenses.map((e) => {
      const dateStr = new Date(e.createdAt).toISOString().split('T')[0];
      const desc = `"${(e.description || '').replace(/"/g, '""')}"`;
      const cat = `"${(e.category || 'General').replace(/"/g, '""')}"`;
      const paidBy = `"${(e.paidBy?.name || 'Roommate').replace(/"/g, '""')}"`;
      const amt = (e.amount || 0).toFixed(2);
      const curr = activeHousehold?.settings?.currency || 'USD';
      return [dateStr, desc, cat, paidBy, amt, curr].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeName = (activeHousehold?.name || 'household').toLowerCase().replace(/\s+/g, '-');
    link.setAttribute('download', `${safeName}-ledger-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success('Household ledger exported to CSV format! 📄');
  };

  const handleRecordBill = () => {
    if (onRecordBill) {
      onRecordBill();
    }
    navigate('/expenses');
  };

  return (
    <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header & Actions */}
      <CardHeader className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4 space-y-0">
        <div>
          <CardTitle className="font-bold text-lg text-foreground font-display tracking-tight">
            Household Ledger &amp; Parity Telemetry
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated balance resolution based on real rent, utilities, and daily shared staples.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            type="button"
            onClick={handleRecordBill}
            className="px-4 py-2 min-h-[44px] h-auto rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-b-2 border-primary-fixed-dim"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Shared Bill</span>
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleExportCSV}
            className="px-4 py-2 min-h-[44px] h-auto rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs border-border active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-6">
        {/* Parity Gauge Strip (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Metric 1: Communal Fairness Score */}
          <Card className="bg-surface-container p-4 rounded-xl border-border/80 flex flex-col shadow-xs">
            <CardContent className="p-0 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-primary" />
                Communal Fairness Score
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-extrabold text-3xl text-primary font-mono">
                  {fairnessScore}%
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs font-bold font-mono ${
                    fairnessScore >= 80
                      ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                      : 'text-warning bg-warning/10 border-warning/20'
                  }`}
                >
                  {fairnessScore >= 80 ? 'Balanced' : 'Uneven Split'}
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                Spend distribution across {householdMembers.length} active flatmate{householdMembers.length === 1 ? '' : 's'}.
              </p>
            </CardContent>
          </Card>

          {/* Metric 2: Utilities Outlay */}
          <Card className="bg-surface-container p-4 rounded-xl border-border/80 flex flex-col shadow-xs">
            <CardContent className="p-0 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-secondary" />
                Utilities &amp; Bills Tracked
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-extrabold text-3xl text-foreground font-mono">
                  {currencySymbol}{utilitiesTotal.toFixed(2)}
                </span>
                <span className="text-[11px] text-muted-foreground font-mono">Electric + Internet + Gas</span>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                Aggregated communal infrastructure expenses recorded this cycle.
              </p>
            </CardContent>
          </Card>

          {/* Metric 3: Staples & Pantry */}
          <Card className="bg-surface-container p-4 rounded-xl border-border/80 flex flex-col shadow-xs">
            <CardContent className="p-0 flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-tertiary" />
                Shared Pantry &amp; Supplies
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-extrabold text-3xl text-foreground font-mono">
                  {currencySymbol}{staplesTotal.toFixed(2)}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs font-bold text-secondary font-mono bg-secondary/10 border-secondary/20"
                >
                  Shared Items
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
                Groceries, dish soap, detergent pods, trash bags, and paper towels.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Transaction Table */}
        <div className="flex flex-col gap-2 pt-2">
          <span className="font-bold text-xs text-foreground font-display">
            Recent Shared Ledger Entries ({expenses.length})
          </span>
          <div className="w-full bg-surface-container-low rounded-xl border border-border overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 bg-surface-container px-4 py-2.5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
              <div className="col-span-5 sm:col-span-4">Item &amp; Category</div>
              <div className="col-span-3 sm:col-span-3">Paid By</div>
              <div className="col-span-2 sm:col-span-3 text-right">Communal Cost</div>
              <div className="col-span-2 sm:col-span-2 text-right">Your Share</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-border/60">
              {isLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground font-mono">
                  Loading communal expenses...
                </div>
              ) : sortedExpenses.length > 0 ? (
                sortedExpenses.slice(0, 10).map((expense) => {
                  const isYouPayer =
                    (currentUserId && expense.paidById === currentUserId) ||
                    (expense.paidBy?.userId && expense.paidBy.userId === currentUserId) ||
                    (name && expense.paidBy?.name?.toLowerCase() === name.toLowerCase());

                  const memberCount = Math.max(1, householdMembers.length);
                  const splitAmount =
                    expense.splits?.find((s) => s.userId === currentUserId)?.shareAmount ??
                    expense.amount / memberCount;

                  const dateFormatted = new Date(expense.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <div
                      key={expense.expenseId}
                      className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-surface-container/50 transition-colors"
                    >
                      <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center shrink-0">
                          {getCategoryIcon(expense.category, expense.description)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-foreground truncate">
                            {expense.description}
                          </span>
                          <span className="text-muted-foreground text-[10px] font-mono hidden sm:inline truncate">
                            {dateFormatted} • {expense.category || 'Shared'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-3 sm:col-span-3 text-foreground font-medium truncate">
                        {isYouPayer ? `${name || 'You'} (You)` : expense.paidBy?.name || 'Flatmate'}
                      </div>
                      <div className="col-span-2 sm:col-span-3 text-right font-mono font-bold text-foreground">
                        {currencySymbol}{(expense.amount || 0).toFixed(2)}
                      </div>
                      <div
                        className={`col-span-2 sm:col-span-2 text-right font-mono font-bold ${
                          isYouPayer
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-destructive'
                        }`}
                      >
                        {isYouPayer ? '+' : '-'}{currencySymbol}
                        {(isYouPayer ? expense.amount - splitAmount : splitAmount).toFixed(2)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
                  <Receipt className="w-8 h-8 text-primary/60 mb-1" />
                  <span className="font-bold text-foreground">No Shared Bills Recorded Yet</span>
                  <span className="text-[11px] font-mono">
                    Use "+ Record Shared Bill" to log your first shared rent or utility expense.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FairnessLedgerTab;

