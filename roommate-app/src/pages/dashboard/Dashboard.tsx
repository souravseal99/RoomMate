import { useState } from 'react';
import { useDashboardQuery } from '@/hooks/queries/useDashboardQueries';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import useHousehold from '@/hooks/useHousehold';
import DashboardHeroCockpit from '@/components/dashboard/DashboardHeroCockpit';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import OdometerBalanceCard from '@/components/dashboard/OdometerBalanceCard';
import DutyStampPunchcard from '@/components/dashboard/DutyStampPunchcard';
import PantryFuelGauges from '@/components/dashboard/PantryFuelGauges';
import KitchenTableCard from '@/components/dashboard/KitchenTableCard';
import ActivityFeedSection from '@/components/dashboard/ActivityFeedSection';
import SettlementModal from '@/components/dashboard/SettlementModal';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export function Dashboard() {
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const { data: stats, isLoading, isError } = useDashboardQuery();
  const { activeHouseholdId, activeHousehold } = useHousehold();
  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);
  const { data: inventory = [] } = useInventoryQuery(activeHouseholdId);

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
        <p className="text-muted-foreground text-xs">
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

  return (
    <div className="max-w-[1240px] mx-auto py-1 space-y-4">
      {/* 1. Recessed Dominant Glanceable Hero Cockpit */}
      <DashboardHeroCockpit
        netBalance={expensesAmount}
        urgentChoreName={nextChore?.description || 'Wipe Kitchen Quartz & Degrease Stove'}
        lowStockItems={lowStockItems}
        onOpenSettleModal={() => setIsSettleModalOpen(true)}
      />

      {/* 2. 1-Tap Living Actions Bar */}
      <QuickActionsBar
        lowStockCount={lowStockItems.length > 0 ? lowStockItems.length : 2}
        onOpenSettleModal={() => setIsSettleModalOpen(true)}
      />

      {/* 3. Balanced 2-Column Main Grid (7 Cols Left / 5 Cols Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start w-full">
        {/* Left Operational Wing (7 Cols on desktop) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Active House Ledger & Monospace Split-Flap Readout */}
          <OdometerBalanceCard
            expensesAmount={expensesAmount}
            onOpenSettleModal={() => setIsSettleModalOpen(true)}
          />

          {/* Shared Pantry Inventory Card */}
          <PantryFuelGauges />
        </div>

        {/* Right Communal Wing (5 Cols on desktop) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Duty Stamp Card & Rotation with 10-Day Streak */}
          <DutyStampPunchcard />

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
        recipientName="Alex Chen"
        recipientSubtext={activeHousehold?.name || 'NorthWing #4B'}
        amount={15.0}
        paymentMethod="Default House Checking"
      />
    </div>
  );
}

export default Dashboard;
