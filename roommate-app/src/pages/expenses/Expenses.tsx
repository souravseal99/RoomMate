import { useState, useMemo } from 'react';
import { Plus, Receipt, AlertCircle } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { getCurrentUserId } from '@/utils/jwt';
import {
  useExpensesQuery,
  useExpenseBalancesQuery,
  useDeleteExpenseMutation,
} from '@/hooks/queries/useExpenseQueries';
import {
  NetBalanceBanner,
  RoommateBalancesGrid,
  ExpenseActivityLedger,
  AddExpenseDialog,
  QuickSettleModal,
  NetBalanceBannerSkeleton,
  RoommateBalancesSkeleton,
  ExpenseLedgerSkeleton,
} from '@/components/expenses';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Expenses() {
  const { selectedHousehold, householdMembers } = useHousehold();
  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const householdId = selectedHousehold?.key || '';

  // Query Hooks
  const { data: expenses = [], isLoading: isExpensesLoading } = useExpensesQuery(householdId);
  const { data: balancesData, isLoading: isBalancesLoading } = useExpenseBalancesQuery(householdId);
  const deleteExpenseMutation = useDeleteExpenseMutation();

  // Dialog State
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQuickSettleOpen, setIsQuickSettleOpen] = useState(false);
  const [activeSettlementTarget, setActiveSettlementTarget] = useState<{
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  } | null>(null);

  const balances = balancesData?.balances || [];
  const settlements = balancesData?.settlements || [];

  // Compute Current User's Net Position
  const currentUserNetBalance = useMemo(() => {
    if (!currentUserId || balances.length === 0) return 0;
    const entry = balances.find((b) => b.userId === currentUserId);
    return entry ? entry.balance : 0;
  }, [balances, currentUserId]);

  const hasPendingDebts = useMemo(() => {
    return settlements.length > 0 || Math.abs(currentUserNetBalance) > 0.01;
  }, [settlements, currentUserNetBalance]);

  const handleDeleteExpense = async (expenseId: string) => {
    if (!householdId) return;
    try {
      await deleteExpenseMutation.mutateAsync({ expenseId, householdId });
      toast.success('Expense removed successfully');
    } catch (error: any) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense');
    }
  };

  const handleOpenSettle = (target?: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }) => {
    if (target) {
      setActiveSettlementTarget(target);
    } else {
      setActiveSettlementTarget(null);
    }
    setIsQuickSettleOpen(true);
  };

  if (!selectedHousehold?.value) {
    return (
      <section className="container mx-auto px-4 py-8 max-w-5xl flex flex-col items-center justify-center min-h-[60vh] text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center text-muted-foreground border border-border">
          <AlertCircle className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1 max-w-md">
          <h2 className="text-xl font-bold text-foreground">No Household Selected</h2>
          <p className="text-xs text-muted-foreground">
            Please select or create a household space in the top navigation bar to view and manage shared expenses.
          </p>
        </div>
      </section>
    );
  }

  const isLoading = isExpensesLoading || isBalancesLoading;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-border shrink-0">
            <Receipt className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground">
              Expenses & Balances
            </h1>
            <p className="text-xs text-muted-foreground">
              Zero-mental-math debt minimization for{' '}
              <span className="font-semibold text-foreground">{selectedHousehold.value}</span>
            </p>
          </div>
        </div>

        {/* Action Header Button */}
        <Button
          onClick={() => setIsAddExpenseOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
        >
          <Plus className="w-4 h-4" /> Log Expense
        </Button>
      </div>

      {/* Main Content Sections */}
      {isLoading ? (
        <div className="space-y-6">
          <NetBalanceBannerSkeleton />
          <RoommateBalancesSkeleton />
          <ExpenseLedgerSkeleton />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Net Balance Snapshot Banner */}
          <NetBalanceBanner
            netBalance={currentUserNetBalance}
            onQuickSettle={() => handleOpenSettle()}
            hasPendingDebts={hasPendingDebts}
          />

          {/* Roommate Balances Grid */}
          <RoommateBalancesGrid
            householdMembers={householdMembers}
            balances={balances}
            settlements={settlements}
            currentUserId={currentUserId}
            onSettle={(target) => handleOpenSettle(target)}
            settlingKey={deleteExpenseMutation.isPending ? 'pending' : null}
          />

          {/* Recent Activity Ledger */}
          <ExpenseActivityLedger
            expenses={expenses}
            currentUserId={currentUserId}
            onDeleteExpense={handleDeleteExpense}
            deletingExpenseId={deleteExpenseMutation.isPending ? 'deleting' : null}
          />
        </div>
      )}

      {/* Floating Action Button (FAB) for Mobile / Easy Access */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40">
        <button
          aria-label="Log Expense"
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary-foreground/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Add Expense Dialog */}
      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        householdId={householdId}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
      />

      {/* Quick Settle Modal */}
      <QuickSettleModal
        open={isQuickSettleOpen}
        onOpenChange={setIsQuickSettleOpen}
        householdId={householdId}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
        initialSettlement={activeSettlementTarget}
        pendingSettlements={settlements}
      />
    </div>
  );
}
