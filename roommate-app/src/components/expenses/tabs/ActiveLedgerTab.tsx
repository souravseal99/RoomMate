import { NetBalanceBanner } from '../NetBalanceBanner';
import { QuickSplitDock } from './QuickSplitDock';
import { FlatmateStandingsCard } from './FlatmateStandingsCard';
import { MonthlySharedCeilingCard } from './MonthlySharedCeilingCard';
import { SharedActivityLedger } from './SharedActivityLedger';
import type { ExpenseResponse, BalanceEntry } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';

interface ActiveLedgerTabProps {
  householdId: string;
  householdMembers: HouseholdMember[];
  currentUserId: string;
  expenses: ExpenseResponse[];
  balances: BalanceEntry[];
  netBalance: number;
  hasPendingDebts: boolean;
  onQuickSettle: () => void;
  onDeleteExpense: (expenseId: string) => void;
  deletingExpenseId?: string | null;
  onOpenSettleModal?: (target?: any) => void;
}

export function ActiveLedgerTab({
  householdId,
  householdMembers,
  currentUserId,
  expenses,
  balances,
  netBalance,
  hasPendingDebts,
  onQuickSettle,
  onDeleteExpense,
  deletingExpenseId,
  onOpenSettleModal,
}: ActiveLedgerTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Net Position & Fast Settle Banner */}
      <NetBalanceBanner
        netBalance={netBalance}
        onQuickSettle={onQuickSettle}
        hasPendingDebts={hasPendingDebts}
      />

      {/* 2. 1-Tap Quick Split Control Deck */}
      <QuickSplitDock
        householdId={householdId}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
      />

      {/* 3. Operational 2-Column Grid: Standings & Monthly Ceiling */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6">
          <FlatmateStandingsCard
            balances={balances}
            householdMembers={householdMembers}
            currentUserId={currentUserId}
            onOpenSettleModal={onOpenSettleModal}
          />
        </div>

        <div className="lg:col-span-6">
          <MonthlySharedCeilingCard expenses={expenses} />
        </div>
      </div>

      {/* 3. Detailed Shared Activity Feed */}
      <SharedActivityLedger
        expenses={expenses}
        currentUserId={currentUserId}
        onDeleteExpense={onDeleteExpense}
        deletingExpenseId={deletingExpenseId}
      />
    </div>
  );
}
