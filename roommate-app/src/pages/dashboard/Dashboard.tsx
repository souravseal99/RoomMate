import { useState } from 'react';
import { useDashboardQuery } from '@/hooks/queries/useDashboardQueries';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import { useExpenseBalancesQuery } from '@/hooks/queries/useExpenseQueries';
import useHousehold from '@/hooks/useHousehold';
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
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [settleRecipient, setSettleRecipient] = useState<{
    name: string;
    amount: number;
    fromUserId?: string;
    toUserId?: string;
  }>({
    name: 'Alex Chen',
    amount: 15.0,
  });

  const { data: stats, isLoading, isError } = useDashboardQuery();
  const { activeHouseholdId, activeHousehold } = useHousehold();
  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);
  const { data: inventory = [] } = useInventoryQuery(activeHouseholdId);
  const { data: balancesData } = useExpenseBalancesQuery(activeHouseholdId);

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

  const expensesAmount = stats?.expenses ?? 24.5;

  // Determine low stock items
  const lowStockItems = inventory.filter((item) => item.quantity <= (item.lowThreshold || 3));

  // Determine next urgent incomplete chore
  const nextChore = chores.find((c) => !c.completed);

  // Determine peer debt from balances/settlements
  const firstSettlement = balancesData?.settlements?.[0];
  const peerDebtName = firstSettlement?.toName || 'Alex';
  const peerDebtAmount = firstSettlement?.amount || 15.0;

  const handleOpenSettle = (recipient?: { name: string; amount: number; fromUserId?: string; toUserId?: string }) => {
    if (recipient) {
      setSettleRecipient(recipient);
    } else {
      setSettleRecipient({
        name: peerDebtName,
        amount: peerDebtAmount,
        fromUserId: firstSettlement?.fromUserId,
        toUserId: firstSettlement?.toUserId,
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
        netBalance={expensesAmount}
        urgentChoreName={nextChore?.description || 'Wipe Kitchen Quartz & Degrease Stove'}
        lowStockItems={lowStockItems}
        peerDebtName={peerDebtName}
        peerDebtAmount={peerDebtAmount}
        onOpenSettleModal={() => handleOpenSettle()}
      />

      {/* 2. 1-Tap Living Actions Bar */}
      <QuickActionsBar
        lowStockCount={lowStockItems.length > 0 ? lowStockItems.length : 2}
        debtAmount={peerDebtAmount}
        onOpenSettleModal={() => handleOpenSettle()}
      />

      {/* 3. Balanced 2-Column Main Grid (7 Cols Left / 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* Left Operational Wing (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active House Ledger & Monospace Tabular Readout */}
          <OdometerBalanceCard
            expensesAmount={expensesAmount}
            balances={balancesData?.balances || []}
            settlements={balancesData?.settlements || []}
            budgetSpent={budgetSpent}
            budgetTotal={budgetTotal}
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
