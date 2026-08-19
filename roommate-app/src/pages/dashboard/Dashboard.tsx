import { useEffect, useMemo, useState } from 'react';
import { Bell, ArrowRight, Users, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import dashboardApi from '@/api/dashboardApi';

interface RecentExpense {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  date: string;
  household: string;
}

interface RecentChore {
  id: string;
  title: string;
  status: string;
  assignee: string;
  dueDate: string;
  household: string;
}

interface StatsProps {
  householdCount: number;
  pendingChoresCount: number;
  expenses: number;
  recentExpenses: RecentExpense[];
  recentChores: RecentChore[];
}

export function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<StatsProps>();
  const dashboardAPI = useMemo(dashboardApi, []);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const data = await dashboardAPI.fetchDashboardData();
        setStats(data);
      } catch (e) {
        console.error('Failed to load dashboard data:', e);
      }
    }
    loadDashboard();
  }, [dashboardAPI]);

  // Formatted date header string for desktop (e.g., "Saturday, 1 Aug")
  const currentDateFormatted = useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
    });
  }, []);

  return (
    <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background text-foreground font-sans pb-16 md:pb-0">
      {/* Mobile Fixed Top App Bar (Stitch fa08588ff4184b42bb20d2b0c3f31aff) */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-background border-b border-border flex justify-between items-center px-4 z-40 md:hidden">
        <div className="flex items-center gap-2 text-foreground font-bold text-lg">
          <Users className="w-5 h-5 text-primary-container" />
          <h1>RoomMate</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="text-primary-container font-bold text-xs uppercase tracking-wider hover:opacity-80 transition-opacity cursor-pointer flex items-center gap-1"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </header>

      {/* Desktop Header Bar (Stitch 977f99f40ef54937aab6f5204cb82880) */}
      <header className="hidden md:flex w-full h-16 bg-card border-b border-border justify-between items-center px-8 shrink-0 transition-colors">
        <div className="flex items-center">
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
            {currentDateFormatted}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            className="text-muted-foreground hover:text-foreground transition-colors relative cursor-pointer p-1"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary-container rounded-full" />
          </button>
          <Button
            onClick={() => navigate('/expenses')}
            className="bg-primary-container hover:bg-primary-container/90 text-primary-foreground text-xs uppercase tracking-wider font-bold px-4 py-2 rounded-lg cursor-pointer transition-opacity flex items-center gap-2"
          >
            Add expense
          </Button>
        </div>
      </header>

      {/* Main Body Content Canvas */}
      <main className="flex-1 overflow-y-auto mt-14 md:mt-0 p-4 md:p-8">
        <div className="max-w-md mx-auto md:max-w-5xl space-y-6 md:space-y-8">
          {/* Dynamic Greeting (Desktop) */}
          <div className="hidden md:block">
            <h2 className="text-lg md:text-xl font-medium leading-snug max-w-2xl text-foreground">
              {stats?.recentExpenses?.[0]
                ? `${stats.recentExpenses[0].paidBy} added ${stats.recentExpenses[0].title}`
                : "Rahul owes you $50.00, Alex added groceries."}
            </h2>
          </div>

          {/* Primary Focal Point / Balance Strip (Mobile) */}
          <section className="md:hidden flex flex-col items-start border-b border-border pb-4">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
              You're owed
            </span>
            <div className="text-3xl font-bold text-primary-container mt-1">
              ${(stats?.expenses ?? 0).toFixed(2)}
            </div>
            <div className="flex gap-2 mt-3">
              <span className="text-xs text-foreground bg-card border border-border px-2.5 py-1 rounded-sm font-medium">
                {stats?.pendingChoresCount ?? 0} chores pending
              </span>
              <span className="text-xs text-foreground bg-card border border-border px-2.5 py-1 rounded-sm font-medium">
                2 items low stock
              </span>
            </div>
          </section>

          {/* Desktop Balance Strip Card (Stitch 977f99f40ef54937aab6f5204cb82880) */}
          <Card className="hidden md:flex w-full bg-card border border-border rounded-lg p-6 flex-col md:flex-row md:items-end justify-between gap-6 shadow-xs">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium mb-1">
                Your balance this month
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-medium text-foreground">You're owed</span>
                <span className="text-3xl md:text-[32px] font-bold text-primary-container leading-none">
                  ${(stats?.expenses ?? 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 border border-border rounded-full flex items-center gap-2 bg-background">
                <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                <span className="text-xs font-medium text-foreground">
                  {stats?.pendingChoresCount ?? 0} chores pending
                </span>
              </div>
              <div className="px-3 py-1.5 border border-border rounded-full flex items-center gap-2 bg-background">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span className="text-xs font-medium text-foreground">2 items low stock</span>
              </div>
            </div>
          </Card>

          {/* Row 2: 60/40 Two-Column Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            {/* Left Column (60%) - What Needs Attention */}
            <section className="lg:col-span-7 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-xs font-semibold md:font-semibold text-foreground md:text-muted-foreground md:uppercase md:tracking-widest">
                What Needs Attention
              </h3>

              {/* Mobile Border-Left Indicator List */}
              <div className="md:hidden flex flex-col gap-2.5">
                <div className="pl-3 border-l-4 border-destructive py-1">
                  <p className="text-sm font-medium text-foreground">
                    Clean kitchen is overdue — yours
                  </p>
                </div>
                <div className="pl-3 border-l-4 border-primary-container py-1">
                  <p className="text-sm font-medium text-foreground">Paper towels down to 2 rolls</p>
                </div>
                <div className="pl-3 border-l-4 border-border py-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Vacuum living room due today — Taylor's
                  </p>
                </div>
              </div>

              {/* Desktop Indicator List */}
              <ul className="hidden md:block space-y-4">
                {stats?.recentChores && stats.recentChores.length > 0 ? (
                  stats.recentChores.slice(0, 3).map((chore) => (
                    <li key={chore.id} className="flex items-start gap-3">
                      <span
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          chore.status === 'OVERDUE'
                            ? 'bg-destructive'
                            : chore.status === 'PENDING'
                              ? 'bg-primary-container'
                              : 'bg-muted-foreground'
                        }`}
                      />
                      <span className="text-lg font-medium leading-tight text-foreground">
                        {chore.title} — assigned to {chore.assignee}
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-destructive mt-2 shrink-0" />
                      <span className="text-lg font-medium leading-tight text-foreground">
                        Clean kitchen is 2 days overdue — yours
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-primary-container mt-2 shrink-0" />
                      <span className="text-lg font-medium leading-tight text-foreground">
                        Paper Towels down to 2 packs (low stock)
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-muted-foreground mt-2 shrink-0" />
                      <span className="text-lg font-medium leading-tight text-muted-foreground">
                        Vacuum living room due today — Taylor's
                      </span>
                    </li>
                  </>
                )}
              </ul>

              <button
                type="button"
                onClick={() => navigate('/chores')}
                className="inline-flex items-center gap-1 text-xs text-primary-container uppercase tracking-wider font-bold mt-2 hover:underline cursor-pointer"
              >
                See all chores <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </section>

            {/* Right Column (40%) - Who Owes Who */}
            <section className="lg:col-span-5 space-y-3 md:space-y-4">
              <h3 className="text-sm md:text-xs font-semibold md:font-semibold text-foreground md:text-muted-foreground md:uppercase md:tracking-widest">
                Who Owes Who
              </h3>

              <ul className="space-y-3 md:space-y-4">
                {stats?.recentExpenses && stats.recentExpenses.length > 0 ? (
                  stats.recentExpenses.slice(0, 3).map((exp) => (
                    <li
                      key={exp.id}
                      className="flex items-center justify-between border-b border-border pb-2.5 md:pb-2"
                    >
                      <span className="text-sm md:text-lg font-medium text-foreground">
                        {exp.paidBy}:{' '}
                        <span className="text-muted-foreground font-normal">
                          owes ${exp.amount.toFixed(2)}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/expenses')}
                        className="text-xs text-primary-container uppercase font-bold hover:underline shrink-0 cursor-pointer ml-2"
                      >
                        Remind
                      </button>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-sm md:text-lg font-medium text-foreground">
                        Taylor Smith: <span className="text-muted-foreground font-normal">owes you $25.00</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/expenses')}
                        className="text-xs text-primary-container uppercase font-bold hover:underline shrink-0 cursor-pointer ml-2"
                      >
                        Remind
                      </button>
                    </li>
                    <li className="flex items-center justify-between border-b border-border pb-2">
                      <span className="text-sm md:text-lg font-medium text-foreground">
                        Jordan Lee: <span className="text-muted-foreground font-normal">owes you $50.00</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate('/expenses')}
                        className="text-xs text-primary-container uppercase font-bold hover:underline shrink-0 cursor-pointer ml-2"
                      >
                        Remind
                      </button>
                    </li>
                  </>
                )}
              </ul>
            </section>
          </div>

          {/* Desktop & Mobile Recent Activity Section (Stitch 977f99f40ef54937aab6f5204cb82880) */}
          <section className="space-y-4 pt-6 border-t border-border">
            <h3 className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              Recent Activity
            </h3>
            <ul className="w-full flex flex-col divide-y divide-border">
              <li className="flex items-center gap-4 py-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-card border border-border shrink-0 font-bold text-xs flex items-center justify-center text-foreground">
                  JL
                </div>
                <span className="text-base md:text-lg font-medium flex-1 text-foreground">
                  Jordan Lee added Espresso Machine & Coffee Supplies
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">
                  2 hrs ago
                </span>
              </li>
              <li className="flex items-center gap-4 py-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-card border border-border shrink-0 font-bold text-xs flex items-center justify-center text-foreground">
                  TS
                </div>
                <span className="text-base md:text-lg font-medium flex-1 text-foreground">
                  Taylor Smith settled $50.00 for Wi-Fi
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">
                  Yesterday
                </span>
              </li>
              <li className="flex items-center gap-4 py-3 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-card border border-border shrink-0 font-bold text-xs flex items-center justify-center text-foreground">
                  AJ
                </div>
                <span className="text-base md:text-lg font-medium flex-1 text-foreground">
                  Alex Johnson completed Task: Clean Kitchen Countertops
                </span>
                <span className="text-xs text-muted-foreground uppercase tracking-widest shrink-0">
                  Yesterday
                </span>
              </li>
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
