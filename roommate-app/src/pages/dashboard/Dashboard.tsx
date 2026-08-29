import { useDashboardQuery } from '@/hooks/queries/useDashboardQueries';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import NetBalanceHeroCard from '@/components/dashboard/NetBalanceHeroCard';
import QuickActionsBar from '@/components/dashboard/QuickActionsBar';
import LowStockAlertCard from '@/components/dashboard/LowStockAlertCard';
import TodayChoresCarousel from '@/components/dashboard/TodayChoresCarousel';
import ActivityFeedSection from '@/components/dashboard/ActivityFeedSection';
import DashboardSkeleton from '@/components/dashboard/DashboardSkeleton';

export function Dashboard() {
  const { data: stats, isLoading, isError } = useDashboardQuery();

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto md:max-w-5xl py-2 space-y-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto md:max-w-5xl py-8 text-center space-y-3">
        <p className="text-destructive font-bold text-base">
          Failed to load dashboard metrics.
        </p>
        <p className="text-muted-foreground text-xs">
          Please make sure the server is reachable and try again.
        </p>
      </div>
    );
  }

  const expensesAmount = stats?.expenses ?? 0;
  const recentExpenses = stats?.recentExpenses ?? [];
  const recentChores = stats?.recentChores ?? [];

  return (
    <div className="max-w-md mx-auto md:max-w-5xl py-2 space-y-6">
      {/* 1. Header Ribbon (Desktop only; on mobile AppBar handles the top ribbon) */}
      <div className="hidden md:block">
        <DashboardHeader />
      </div>

      {/* 2. Responsive Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column (Desktop: 7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Net Balance Hero Card */}
          <NetBalanceHeroCard
            expensesAmount={expensesAmount}
            recentExpenses={recentExpenses}
          />

          {/* Quick Actions 4-Pill Bar */}
          <QuickActionsBar lowStockCount={2} />

          {/* Low Stock Pantry Warning Card */}
          <LowStockAlertCard count={2} itemsSummary="Milk, Eggs (2 Items)" />
        </div>

        {/* Right Column (Desktop: 5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Today's Chores Carousel */}
          <TodayChoresCarousel chores={recentChores} />

          {/* Live Activity Feed */}
          <ActivityFeedSection expenses={recentExpenses} chores={recentChores} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
