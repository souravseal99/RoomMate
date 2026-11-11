import { useState, useMemo } from 'react';
import { useDashboardQuery } from '@/hooks/queries/useDashboardQueries';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import { useExpenseBalancesQuery, useExpensesQuery } from '@/hooks/queries/useExpenseQueries';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { getCurrentUserId } from '@/utils/jwt';
import {
  DashboardHeroCockpit,
  QuickActionsBar,
  OdometerBalanceCard,
  DutyStampPunchcard,
  PantryFuelGauges,
  KitchenTableCard,
  ActivityFeedSection,
  SettlementModal,
  DashboardSkeleton,
} from '@/components/dashboard';

export function Dashboard() {
  const { userId: authUserId } = useAuth();
  const currentUserId = authUserId || getCurrentUserId() || '';
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleRecipient, setSettleRecipient] = useState<{
    name: string;
    amount: number;
    fromUserId?: string;
    toUserId?: string;
  }>({
    name: '',
    amount: 0,
  });

  const { data: stats, isLoading, isError } = useDashboardQuery();
  const { activeHouseholdId, activeHousehold } = useHousehold();
  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);
  const { data: inventory = [] } = useInventoryQuery(activeHouseholdId);
  const { data: balancesData } = useExpenseBalancesQuery(activeHouseholdId);
  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);

  // Authenticated user's real net balance in the active household
  const currentMemberBalance = useMemo(() => {
    if (!balancesData?.balances || !currentUserId) {
      return stats?.expenses ?? 0;
    }
    const myEntry = balancesData.balances.find((b) => b.userId === currentUserId);
    return myEntry?.balance ?? 0;
  }, [balancesData?.balances, currentUserId, stats?.expenses]);

  // Determine low stock items based on household inventory thresholds
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= (item.lowThreshold ?? item.threshold ?? 2));
  }, [inventory]);

  // Determine next urgent incomplete chore (prioritize high priority then earliest due date)
  const nextChore = useMemo(() => {
    const pending = chores.filter((c) => !c.completed);
    return [...pending].sort((a, b) => {
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
      return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
    })[0];
  }, [chores]);

  // Format chore due text
  const urgentChoreDueText = useMemo(() => {
    if (!nextChore?.nextDue) return '';
    try {
      const dueDate = new Date(nextChore.nextDue);
      const now = new Date();
      const isToday = dueDate.toDateString() === now.toDateString();
      const timeStr = dueDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
      return isToday
        ? `Due Today · ${timeStr}`
        : `Due ${dueDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${timeStr}`;
    } catch {
      return 'Due Soon';
    }
  }, [nextChore?.nextDue]);

  // Determine user-specific peer debt resolution
  const { peerDebtName, peerDebtAmount, peerDebtDescription, isUserDebtor, primaryDebt } =
    useMemo(() => {
      const settlements = balancesData?.settlements || [];

      // 1. Check if the authenticated user owes money
      const myDebtsOwed = settlements
        .filter((s) => s.fromUserId === currentUserId && s.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      if (myDebtsOwed.length > 0) {
        const top = myDebtsOwed[0];
        const latestExp = expenses.find((e) => e.paidById === top.toUserId);
        return {
          peerDebtName: top.toName,
          peerDebtAmount: top.amount,
          peerDebtDescription: latestExp?.description || 'Household Split',
          isUserDebtor: true,
          primaryDebt: top,
        };
      }

      // 2. Check if roommates owe the authenticated user money
      const debtsOwedToMe = settlements
        .filter((s) => s.toUserId === currentUserId && s.amount > 0)
        .sort((a, b) => b.amount - a.amount);

      if (debtsOwedToMe.length > 0) {
        const top = debtsOwedToMe[0];
        return {
          peerDebtName: top.fromName,
          peerDebtAmount: top.amount,
          peerDebtDescription: 'Outstanding Share',
          isUserDebtor: false,
          primaryDebt: top,
        };
      }

      // 3. User is all settled up
      return {
        peerDebtName: '',
        peerDebtAmount: 0,
        peerDebtDescription: 'All settled up',
        isUserDebtor: true,
        primaryDebt: undefined,
      };
    }, [balancesData?.settlements, currentUserId, expenses]);

  if (isLoading) {
    return (
      <div className="max-w-[1240px] mx-auto py-2 space-y-4">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-[1240px] mx-auto py-12 text-center space-y-3">
        <p className="text-destructive font-bold text-base font-display">
          Failed to load dashboard metrics.
        </p>
        <p className="text-muted-foreground text-xs font-mono">
          Please make sure the server is reachable and try again.
        </p>
      </div>
    );
  }

  const handleOpenSettle = (recipient?: {
    name: string;
    amount: number;
    fromUserId?: string;
    toUserId?: string;
  }) => {
    if (recipient) {
      setSettleRecipient(recipient);
    } else if (primaryDebt) {
      setSettleRecipient({
        name: peerDebtName,
        amount: peerDebtAmount,
        fromUserId: primaryDebt.fromUserId,
        toUserId: primaryDebt.toUserId,
      });
    }
    setIsSettleModalOpen(true);
  };

  const budgetSpent = activeHousehold?.settings?.monthlyCommunalBudget
    ? Math.round(activeHousehold.settings.monthlyCommunalBudget * 0.78)
    : 1420;
  const budgetTotal = activeHousehold?.settings?.monthlyCommunalBudget || 1800;

  return (
    <div className="max-w-[1240px] mx-auto py-1 space-y-4">
      {/* 1. Recessed Dominant Glanceable Hero Cockpit */}
      <DashboardHeroCockpit
        netBalance={currentMemberBalance}
        urgentChoreName={nextChore?.description}
        urgentChoreDueText={urgentChoreDueText}
        lowStockItems={lowStockItems}
        peerDebtName={peerDebtName}
        peerDebtAmount={peerDebtAmount}
        peerDebtDescription={peerDebtDescription}
        isUserDebtor={isUserDebtor}
        onOpenSettleModal={() => handleOpenSettle()}
      />

      {/* 2. 1-Tap Living Actions Bar */}
      <QuickActionsBar
        lowStockCount={lowStockItems.length}
        debtAmount={peerDebtAmount}
        onOpenSettleModal={() => handleOpenSettle()}
      />

      {/* 3. Balanced 2-Column Main Grid (7 Cols Left / 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* Left Operational Wing (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active House Ledger & Monospace Tabular Readout */}
          <OdometerBalanceCard
            expensesAmount={currentMemberBalance}
            balances={balancesData?.balances || []}
            settlements={balancesData?.settlements || []}
            recentBills={balancesData?.recentBills || []}
            budgetSpent={balancesData?.budget?.spent ?? budgetSpent}
            budgetTotal={balancesData?.budget?.total ?? budgetTotal}
            currentUserId={currentUserId}
            onOpenSettleModal={(target) => handleOpenSettle(target)}
          />

          {/* Shared Pantry Inventory Card */}
          <PantryFuelGauges />
        </div>

        {/* Right Communal Wing (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Duty Stamp Card & Rotation with 10-Day Streak */}
          <DutyStampPunchcard urgentChore={nextChore} />

          {/* Tonight's Kitchen Table (Commons & Dinner Coordination) */}
          <KitchenTableCard />

          {/* Household Pulse Activity Feed with Reaction Counters */}
          <ActivityFeedSection />
        </div>
      </div>

      {/* Inline Settlement Dialog Modal */}
      <SettlementModal
        isOpen={isSettleModalOpen}
        onClose={() => setIsSettleModalOpen(false)}
        recipientName={settleRecipient.name}
        recipientSubtext={activeHousehold?.name || 'NorthWing #4B'}
        amount={settleRecipient.amount}
        fromUserId={settleRecipient.fromUserId}
        toUserId={settleRecipient.toUserId}
        paymentMethod="Default House Checking"
      />
    </div>
  );
}

export default Dashboard;
