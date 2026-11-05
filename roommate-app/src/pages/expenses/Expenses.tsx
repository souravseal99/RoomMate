import { useState, useMemo } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { getCurrentUserId } from '@/utils/jwt';
import {
  useExpensesQuery,
  useExpenseBalancesQuery,
  useDeleteExpenseMutation,
} from '@/hooks/queries/useExpenseQueries';
import {
  ExpensesSubHeader,
  ExpensesTabBar,
  ActiveLedgerTab,
  PaybackRoutesTab,
  SpendCapsBudgetsTab,
  ReceiptVaultTab,
  AddExpenseDialog,
  QuickSettleModal,
  SundaySquareUpModal,
  NetBalanceBannerSkeleton,
  RoommateBalancesSkeleton,
  ExpenseLedgerSkeleton,
  type ExpensesTabId,
} from '@/components/expenses';
import { toast } from 'sonner';

export default function Expenses() {
  const { selectedHousehold, householdMembers } = useHousehold();
  const currentUserId = useMemo(() => getCurrentUserId() || '', []);

  const householdId = selectedHousehold?.key || '';
  const householdName = selectedHousehold?.value || 'Household';

  // Tab State (4-tab contextual disclosure)
  const [activeTab, setActiveTab] = useState<ExpensesTabId>('tab-active-ledger');

  // Dialog States
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isQuickSettleOpen, setIsQuickSettleOpen] = useState(false);
  const [isSundaySquareUpOpen, setIsSundaySquareUpOpen] = useState(false);
  const [activeSettlementTarget, setActiveSettlementTarget] = useState<{
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  } | null>(null);

  // Query Hooks
  const { data: expenses = [], isLoading: isExpensesLoading } = useExpensesQuery(householdId);
  const { data: balancesData, isLoading: isBalancesLoading } = useExpenseBalancesQuery(householdId);
  const deleteExpenseMutation = useDeleteExpenseMutation();

  const balances = balancesData?.balances || [];
  const settlements = balancesData?.settlements || [];

  const isLoading = isExpensesLoading || isBalancesLoading;

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

  const handleExportCsv = () => {
    if (expenses.length === 0) {
      toast.info('No expenses available in ledger to export.');
      return;
    }

    const headers = ['Date', 'Description', 'Payer', 'Total Amount', 'Split Count'];
    const rows = expenses.map((e) => [
      new Date(e.createdAt).toISOString().split('T')[0],
      `"${e.description.replace(/"/g, '""')}"`,
      `"${e.paidBy?.name || 'Unknown'}"`,
      e.amount.toFixed(2),
      (e.splits?.length || 1).toString(),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${householdName.toLowerCase().replace(/\s+/g, '-')}-ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success('Household ledger exported to CSV!');
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
            Please select or create a household space in the top navigation bar to view and manage
            shared expenses.
          </p>
        </div>
      </section>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-16 select-none">
      {/* 1. TOP OPERATIONAL SUB-HEADER */}
      <ExpensesSubHeader
        householdName={householdName}
        members={householdMembers}
        onExportCsv={handleExportCsv}
        onOpenSundaySquareUp={() => setIsSundaySquareUpOpen(true)}
      />

      {/* 2. 4-TAB CONTEXTUAL NAVIGATION BAR */}
      <ExpensesTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        badgeCount={{
          ledgerCount: expenses.length,
          debtsCount: settlements.length,
          receiptsCount: 4,
        }}
      />

      {/* 3. DYNAMIC TAB PANELS */}
      {isLoading ? (
        <div className="space-y-6">
          <NetBalanceBannerSkeleton />
          <RoommateBalancesSkeleton />
          <ExpenseLedgerSkeleton />
        </div>
      ) : (
        <div className="transition-all duration-300">
          {activeTab === 'tab-active-ledger' && (
            <ActiveLedgerTab
              householdId={householdId}
              householdMembers={householdMembers}
              currentUserId={currentUserId}
              expenses={expenses}
              balances={balances}
              onDeleteExpense={handleDeleteExpense}
              deletingExpenseId={deleteExpenseMutation.isPending ? 'deleting' : null}
              onOpenSettleModal={handleOpenSettle}
            />
          )}

          {activeTab === 'tab-payback-routes' && (
            <PaybackRoutesTab
              settlements={settlements}
              balances={balances}
              householdMembers={householdMembers}
              currentUserId={currentUserId}
              onSettle={handleOpenSettle}
            />
          )}

          {activeTab === 'tab-spend-caps' && (
            <SpendCapsBudgetsTab
              expenses={expenses}
              householdMembers={householdMembers}
              onOpenSundaySquareUp={() => setIsSundaySquareUpOpen(true)}
            />
          )}

          {activeTab === 'tab-receipts' && <ReceiptVaultTab />}
        </div>
      )}

      {/* FLOATING ACTION BUTTON (Mobile & Desktop Quick Access) */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40">
        <button
          type="button"
          aria-label="Log New Expense"
          onClick={() => setIsAddExpenseOpen(true)}
          className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary-foreground/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer min-h-[44px] min-w-[44px]"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* MODALS */}
      <AddExpenseDialog
        open={isAddExpenseOpen}
        onOpenChange={setIsAddExpenseOpen}
        householdId={householdId}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
      />

      <QuickSettleModal
        open={isQuickSettleOpen}
        onOpenChange={setIsQuickSettleOpen}
        householdId={householdId}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
        initialSettlement={activeSettlementTarget}
        pendingSettlements={settlements}
      />

      <SundaySquareUpModal
        open={isSundaySquareUpOpen}
        onOpenChange={setIsSundaySquareUpOpen}
        householdName={householdName}
      />
    </div>
  );
}
