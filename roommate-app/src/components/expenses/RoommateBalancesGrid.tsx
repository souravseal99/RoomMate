import { useMemo } from 'react';
import { Users, ArrowRightLeft } from 'lucide-react';
import { RoommateBalanceCard } from './RoommateBalanceCard';
import { formatCurrency } from '@/utils/utils';
import type { HouseholdMember } from '@/types/householdTypes';
import type { BalanceEntry, OptimizedSettlement } from '@/types/expenseTypes';

interface RoommateBalancesGridProps {
  householdMembers: HouseholdMember[];
  balances: BalanceEntry[];
  settlements: OptimizedSettlement[];
  currentUserId: string | null;
  onSettle: (settlement: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }) => void;
  settlingKey?: string | null;
}

export function RoommateBalancesGrid({
  householdMembers,
  balances,
  settlements,
  currentUserId,
  onSettle,
  settlingKey,
}: RoommateBalancesGridProps) {
  // Map members with their debt with respect to current user
  const memberBalances = useMemo(() => {
    return householdMembers.map((member) => {
      const memberId = member.userId || member.householdMemberId;
      const memberName = member.user?.name || 'Roommate';
      const isCurrentUser = memberId === currentUserId;

      // Check if this member has an optimized settlement with current user
      const owesCurrentUserSettlement = settlements.find(
        (s) => s.fromUserId === memberId && s.toUserId === currentUserId
      );

      const currentUserOwesSettlement = settlements.find(
        (s) => s.fromUserId === currentUserId && s.toUserId === memberId
      );

      let directDebtWithCurrentUser = 0;
      let settlementDetail: OptimizedSettlement | undefined;

      if (owesCurrentUserSettlement) {
        directDebtWithCurrentUser = owesCurrentUserSettlement.amount;
        settlementDetail = owesCurrentUserSettlement;
      } else if (currentUserOwesSettlement) {
        directDebtWithCurrentUser = -currentUserOwesSettlement.amount;
        settlementDetail = currentUserOwesSettlement;
      } else {
        // Fallback: check general balance
        const generalBalance = balances.find((b) => b.userId === memberId);
        if (generalBalance && !isCurrentUser) {
          // If no direct settlement graph entry, balance might be 0
          directDebtWithCurrentUser = generalBalance.balance;
        }
      }

      return {
        memberId,
        memberName,
        avatarUrl: member.user?.avatarUrl,
        directDebtWithCurrentUser,
        settlementDetail,
        isCurrentUser,
      };
    });
  }, [householdMembers, balances, settlements, currentUserId]);

  // Find other settlements between flatmates not involving current user
  const otherSettlements = useMemo(() => {
    return settlements.filter(
      (s) => s.fromUserId !== currentUserId && s.toUserId !== currentUserId
    );
  }, [settlements, currentUserId]);

  if (householdMembers.length === 0) {
    return null;
  }

  return (
    <section className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-foreground tracking-tight flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          Roommate Balances
        </h3>
        <span className="text-xs font-semibold text-muted-foreground">
          {householdMembers.length} {householdMembers.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {memberBalances.map((member) => (
          <RoommateBalanceCard
            key={member.memberId}
            roommateId={member.memberId}
            roommateName={member.memberName}
            avatarUrl={member.avatarUrl}
            directDebtWithCurrentUser={member.directDebtWithCurrentUser}
            settlementDetail={member.settlementDetail}
            isCurrentUser={member.isCurrentUser}
            onSettle={onSettle}
            isSettling={settlingKey === member.memberId}
          />
        ))}
      </div>

      {/* Other Household Settlements Notice (if any circular debts exist between other flatmates) */}
      {otherSettlements.length > 0 && (
        <div className="bg-surface-container-low rounded-xl p-3.5 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs text-foreground">
          <div className="flex items-center gap-2 font-medium">
            <ArrowRightLeft className="w-4 h-4 text-muted-foreground shrink-0" />
            <span>
              Other optimized transfers:{' '}
              {otherSettlements.map((s, idx) => (
                <span key={idx} className="font-semibold text-foreground mr-2">
                  {s.fromName} → {s.toName} ({formatCurrency(s.amount)})
                </span>
              ))}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground font-medium shrink-0">
            Graph Debt Minimization
          </span>
        </div>
      )}
    </section>
  );
}
