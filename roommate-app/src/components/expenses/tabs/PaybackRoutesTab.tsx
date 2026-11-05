import { DebtMinimizationGraphCard } from './DebtMinimizationGraphCard';
import { PairwiseBalanceMatrixTable } from './PairwiseBalanceMatrixTable';
import type { OptimizedSettlement, BalanceEntry } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';

interface PaybackRoutesTabProps {
  settlements: OptimizedSettlement[];
  balances: BalanceEntry[];
  householdMembers: HouseholdMember[];
  currentUserId: string;
  onSettle: (target: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }) => void;
}

export function PaybackRoutesTab({
  settlements,
  balances,
  householdMembers,
  currentUserId,
  onSettle,
}: PaybackRoutesTabProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* 1. Optimal Debt Minimization Graph Card */}
      <DebtMinimizationGraphCard
        settlements={settlements}
        currentUserId={currentUserId}
        onSettle={onSettle}
      />

      {/* 2. Pairwise Matrix Table */}
      <PairwiseBalanceMatrixTable
        balances={balances}
        householdMembers={householdMembers}
        currentUserId={currentUserId}
        onSettle={onSettle}
      />
    </div>
  );
}
