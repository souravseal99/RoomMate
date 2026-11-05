import { useMemo } from 'react';
import {
  CheckSquare,
  Trash2,
  CheckCircle2,
  Package,
  Droplets,
  ShoppingCart,
  Wallet,
  ArrowRight,
  Send,
  Loader2,
  Award,
  Sparkles,
} from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import { useExpenseBalancesQuery, useExpensesQuery } from '@/hooks/queries/useExpenseQueries';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

interface OverviewVitalsTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenSettleModal?: () => void;
}

export function OverviewVitalsTab({ onNavigateTab, onOpenSettleModal }: OverviewVitalsTabProps) {
  const { activeHousehold, activeHouseholdId, householdMembers } = useHousehold();
  const { email, name } = useAuth();

  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);
  const { data: inventory = [] } = useInventoryQuery(activeHouseholdId || undefined);
  const { data: balancesData } = useExpenseBalancesQuery(activeHouseholdId);
  const { data: expenses = [] } = useExpensesQuery(activeHouseholdId);

  const addLowStockMutation = useAddLowStockToCartMutation();

  // Current user matching
  const currentMember = useMemo(() => {
    return (
      householdMembers.find(
        (m) =>
          (email && m.user?.email?.toLowerCase() === email.toLowerCase()) ||
          (name && m.user?.name?.toLowerCase() === name.toLowerCase())
      ) || null
    );
  }, [householdMembers, email, name]);

  const currentUserId = currentMember?.userId;

  // --- 1. DUTY OPERATIONS / CHORES TELEMETRY ---
  const totalTasks = chores.length;
  const completedTasks = chores.filter((c) => c.completed).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  // Next up pending chore (sorted by nextDue date)
  const upNextChore = useMemo(() => {
    const pending = chores.filter((c) => !c.completed);
    if (pending.length === 0) return null;
    return [...pending].sort(
      (a, b) => new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime()
    )[0];
  }, [chores]);

  // Recently completed chores
  const recentlyCompleted = useMemo(() => {
    return chores.filter((c) => c.completed).slice(0, 2);
  }, [chores]);

  const handleRemindChore = () => {
    if (!upNextChore) return;
    const targetName = upNextChore.assignedToName || 'Roommate';
    toast.success(`Gentle reminder sent to ${targetName} for "${upNextChore.description}"!`, {
      icon: <Send className="w-4 h-4 text-primary" />,
    });
  };

  // --- 2. PANTRY & RESERVES SENSORS ---
  const lowStockItems = useMemo(() => {
    return inventory.filter((item) => item.quantity <= (item.threshold ?? 1));
  }, [inventory]);

  const handlePushCart = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId, {
      onSuccess: () => {
        toast.success(
          `Pushed ${lowStockItems.length} low-stock item${
            lowStockItems.length === 1 ? '' : 's'
          } to shared cart! 🛒`
        );
      },
    });
  };

  // --- 3. FAIRNESS & LEDGER TELEMETRY ---
  const userBalance = useMemo(() => {
    if (!balancesData?.balances || balancesData.balances.length === 0) return 0;
    const found = balancesData.balances.find(
      (b) =>
        (currentUserId && b.userId === currentUserId) ||
        (name && b.name?.toLowerCase() === name.toLowerCase())
    );
    return found ? found.balance : 0;
  }, [balancesData, currentUserId, name]);

  const isNetCredit = userBalance > 0.01;
  const isNetDebt = userBalance < -0.01;

  // Peer settlements involving current user or general settlements
  const relevantSettlements = useMemo(() => {
    if (!balancesData?.settlements || balancesData.settlements.length === 0) return [];
    return balancesData.settlements.slice(0, 2);
  }, [balancesData]);

  // Total Communal Spending
  const totalSpending = useMemo(() => {
    return expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  }, [expenses]);

  // Per-tenant communal outlay
  const memberOutlays = useMemo(() => {
    if (householdMembers.length === 0) return [];
    return householdMembers.map((member, index) => {
      const memberExpenses = expenses.filter(
        (e) =>
          e.paidById === member.userId ||
          e.paidBy?.userId === member.userId ||
          (member.user?.name && e.paidBy?.name?.toLowerCase() === member.user.name.toLowerCase())
      );
      const paidTotal = memberExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
      const percentage = totalSpending > 0 ? Math.round((paidTotal / totalSpending) * 100) : 0;
      const completedCount = chores.filter(
        (c) => c.assignedToId === member.userId && c.completed
      ).length;

      const colors = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-muted-foreground'];
      const color = colors[index % colors.length];

      const isYou =
        (currentUserId && member.userId === currentUserId) ||
        (name && member.user?.name?.toLowerCase() === name.toLowerCase());

      return {
        member,
        paidTotal,
        percentage,
        completedCount,
        color,
        isYou,
      };
    });
  }, [householdMembers, expenses, totalSpending, chores, currentUserId, name]);

  const currencySymbol = activeHousehold?.settings?.currency === 'EUR' ? '€' : '$';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* LEFT COLUMN: Operations, Chores & Pantry Sensors (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Weekly Chores Telemetry Card */}
        <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-4 select-none">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
                <CheckSquare className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <CardTitle className="font-bold text-sm text-foreground font-display leading-tight">
                  Duty Operations
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {totalTasks > 0
                    ? `Household tasks: ${completedTasks} of ${totalTasks} completed`
                    : 'No chores registered yet'}
                </p>
              </div>
            </div>
            {totalTasks > 0 && (
              <Badge
                variant="outline"
                className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold uppercase"
              >
                {completionPercentage}% Done
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-0 flex flex-col gap-4">
            {/* Chore Progress Bar & Visual Gauge */}
            <div className="bg-surface-container rounded-xl p-3.5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground font-display">
                  Weekly Completion
                </span>
                <span className="font-mono font-bold text-primary">
                  {completedTasks} / {totalTasks} ({completionPercentage}%)
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden flex">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-muted-foreground text-[10px] font-mono pt-1">
                <span>Minimum target: 70%</span>
                <span className="text-secondary font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-primary" /> Active Space
                </span>
              </div>
            </div>

            {/* Up Next Duty Item */}
            {upNextChore ? (
              <div className="bg-surface-container-low border border-border p-3.5 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                      Up Next • Due{' '}
                      {new Date(upNextChore.nextDue).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                    <span className="font-bold text-xs text-foreground truncate">
                      {upNextChore.assignedToName || 'Unassigned'}: {upNextChore.description}
                    </span>
                    <span className="text-[11px] text-muted-foreground truncate font-mono">
                      Priority: {upNextChore.priority} • {upNextChore.frequency}
                    </span>
                  </div>
                </div>
                {upNextChore.assignedToName && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemindChore}
                    className="px-3 py-1.5 min-h-[44px] rounded-full bg-surface-container hover:bg-secondary-container hover:text-secondary text-foreground font-semibold text-xs transition-all shrink-0 cursor-pointer active:scale-95"
                  >
                    Remind
                  </Button>
                )}
              </div>
            ) : (
              <div className="bg-surface-container-low border border-border/60 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-muted-foreground">
                <Sparkles className="w-4 h-4 text-primary shrink-0" />
                <span>All scheduled household duties are completed!</span>
              </div>
            )}

            {/* Recently Completed Reel */}
            {recentlyCompleted.length > 0 && (
              <div className="flex flex-col gap-2 pt-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                  Recently Completed
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {recentlyCompleted.map((chore) => (
                    <div
                      key={chore.choreId}
                      className="bg-surface-container p-2.5 rounded-xl flex items-center gap-2 border border-border/60"
                    >
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-xs text-foreground truncate">
                          {chore.description}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {chore.assignedToName || 'Roommate'} • Done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pantry & Critical Household Reserves */}
        <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-4 select-none">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  lowStockItems.length > 0
                    ? 'bg-destructive/15 text-destructive'
                    : 'bg-primary/15 text-primary'
                }`}
              >
                <Package className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="font-bold text-sm text-foreground font-display leading-tight">
                  Pantry &amp; Supplies
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-mono">
                  {lowStockItems.length > 0
                    ? `${lowStockItems.length} item${
                        lowStockItems.length === 1 ? '' : 's'
                      } need replenishment`
                    : 'All inventory items within normal threshold'}
                </p>
              </div>
            </div>
            {lowStockItems.length > 0 ? (
              <Badge
                variant="outline"
                className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border-destructive/20 font-mono text-[10px] font-bold uppercase"
              >
                Low Reserves
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[10px] font-bold uppercase"
              >
                Stocked
              </Badge>
            )}
          </CardHeader>

          <CardContent className="p-0 flex flex-col gap-3">
            {lowStockItems.length > 0 ? (
              <>
                {lowStockItems.slice(0, 3).map((item) => {
                  const threshold = item.threshold ?? 1;
                  const ratio = Math.min(
                    100,
                    Math.round((item.quantity / (threshold * 2 || 2)) * 100)
                  );
                  return (
                    <div
                      key={item.inventoryItemId}
                      className="bg-surface-container rounded-xl p-3 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-foreground">{item.name}</span>
                        </div>
                        <span className="font-mono font-bold text-destructive">
                          {item.quantity} {item.unit || 'units'} Left
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-destructive h-full rounded-full transition-all"
                          style={{ width: `${Math.max(5, ratio)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-muted-foreground text-[10px] font-mono">
                        <span>
                          Threshold: {threshold} {item.unit || 'units'} min reserve
                        </span>
                        <span>Category: {item.category || 'General'}</span>
                      </div>
                    </div>
                  );
                })}

                <Button
                  type="button"
                  onClick={handlePushCart}
                  disabled={addLowStockMutation.isPending}
                  className="w-full min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim disabled:opacity-50 mt-1"
                >
                  {addLowStockMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ShoppingCart className="w-4 h-4" />
                  )}
                  <span>
                    Push {lowStockItems.length} Low Item{lowStockItems.length === 1 ? '' : 's'} to
                    Shared Cart
                  </span>
                </Button>
              </>
            ) : (
              <div className="bg-surface-container rounded-xl p-4 text-center flex flex-col items-center gap-1.5 text-xs text-muted-foreground">
                <Package className="w-6 h-6 text-primary mb-1" />
                <span className="font-bold text-foreground">Pantry Fully Stocked</span>
                <span className="text-[11px]">
                  No supplies are currently below their minimum reserves.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* RIGHT COLUMN: Balance Snapshot, Parity & Communal Outlays (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-4 select-none">
          <CardHeader className="p-0 flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <CardTitle className="font-bold text-sm text-foreground font-display leading-tight">
                  Fairness &amp; Ledger Snapshot
                </CardTitle>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Real-time domestic parity
                </p>
              </div>
            </div>
            <Badge
              variant="outline"
              className="px-2.5 py-1 rounded-full bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold uppercase"
            >
              Current Cycle
            </Badge>
          </CardHeader>

          <CardContent className="p-0 flex flex-col gap-4">
            {/* Odometer Personal Balance Display */}
            <div className="bg-surface-container p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                  Your Personal Net Position
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span
                    className={`font-display font-extrabold text-2xl sm:text-3xl tracking-tight font-mono ${
                      isNetCredit
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : isNetDebt
                          ? 'text-destructive'
                          : 'text-foreground'
                    }`}
                  >
                    {isNetCredit
                      ? `+${currencySymbol}${userBalance.toFixed(2)}`
                      : isNetDebt
                        ? `-${currencySymbol}${Math.abs(userBalance).toFixed(2)}`
                        : `${currencySymbol}0.00`}
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-mono text-xs font-bold uppercase tracking-wide ${
                      isNetCredit
                        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : isNetDebt
                          ? 'text-destructive bg-destructive/10 border-destructive/20'
                          : 'text-muted-foreground bg-muted border-border'
                    }`}
                  >
                    {isNetCredit ? 'Net in Credit' : isNetDebt ? 'Net in Debt' : 'Settled Up'}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground mt-0.5 font-mono">
                  {isNetCredit
                    ? 'You have covered more communal expenses and are owed funds.'
                    : isNetDebt
                      ? 'You have pending shared expenses to reimburse.'
                      : 'Your balance with flatmates is currently fully resolved.'}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
                <Button
                  type="button"
                  onClick={onOpenSettleModal}
                  className="bg-primary text-primary-foreground px-4 py-2 min-h-[44px] h-auto rounded-full font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all text-center cursor-pointer border-b-2 border-primary-fixed-dim"
                >
                  Settle Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onNavigateTab('tab-fairness')}
                  className="bg-surface-container-high text-foreground hover:bg-surface-container px-4 py-2 min-h-[44px] h-auto rounded-full font-semibold text-xs transition-all text-center cursor-pointer active:scale-95 border-border"
                >
                  View Full Ledger
                </Button>
              </div>
            </div>

            {/* Peer Ledger Mini Rows */}
            {relevantSettlements.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relevantSettlements.map((settlement, idx) => {
                  const isIncoming =
                    (currentUserId && settlement.toUserId === currentUserId) ||
                    (name && settlement.toName?.toLowerCase() === name.toLowerCase());

                  return (
                    <div
                      key={idx}
                      className="bg-surface-container-low p-3.5 rounded-xl border border-border flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-foreground">
                          {isIncoming ? settlement.fromName : settlement.toName}
                        </span>
                        <span
                          className={`font-mono font-bold ${
                            isIncoming
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-destructive'
                          }`}
                        >
                          {isIncoming ? '+' : '-'}
                          {currencySymbol}
                          {settlement.amount.toFixed(2)}
                        </span>
                      </div>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {isIncoming
                          ? `${settlement.fromName} owes you`
                          : `You owe ${settlement.toName}`}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-primary uppercase mt-1 inline-flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Active calculation
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-surface-container-low p-3.5 rounded-xl border border-border text-center text-xs text-muted-foreground font-mono">
                No individual peer debts pending.
              </div>
            )}

            {/* Shared Communal Spending Telemetry */}
            <div className="flex flex-col gap-2.5 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-foreground font-display">
                    Monthly Communal Outlay
                  </span>
                  <p className="text-[10px] text-muted-foreground font-mono">
                    Total tracked: {currencySymbol}
                    {totalSpending.toFixed(2)}
                  </p>
                </div>
                <span className="font-mono font-bold text-base text-foreground">
                  {currencySymbol}
                  {totalSpending.toFixed(2)}
                </span>
              </div>

              {/* Tenant Progress Bars */}
              <div className="space-y-2 pt-1">
                {memberOutlays.length > 0 ? (
                  memberOutlays.map((entry) => (
                    <div key={entry.member.householdMemberId} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className={`w-2.5 h-2.5 rounded-full ${entry.color} shrink-0`} />
                          <span className="font-semibold text-foreground truncate">
                            {entry.member.user?.name || 'Roommate'} {entry.isYou ? '(You)' : ''}
                          </span>
                          <span className="text-muted-foreground text-[10px] font-mono shrink-0">
                            • {entry.completedCount} chore{entry.completedCount === 1 ? '' : 's'}
                          </span>
                        </div>
                        <span className="font-mono font-bold text-foreground shrink-0">
                          {currencySymbol}
                          {entry.paidTotal.toFixed(2)} ({entry.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${entry.color}`}
                          style={{ width: `${Math.max(2, entry.percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground font-mono">
                    No flatmate telemetry available.
                  </p>
                )}
              </div>
            </div>

            <Separator className="bg-border/60 my-1" />

            <div className="flex items-center justify-between text-muted-foreground text-xs font-mono">
              <span>Household: {activeHousehold?.name || 'Current Space'}</span>
              <Button
                type="button"
                variant="ghost"
                onClick={() => onNavigateTab('tab-fairness')}
                className="text-primary hover:underline hover:bg-transparent font-bold inline-flex items-center gap-1 cursor-pointer min-h-[44px] p-0 h-auto"
              >
                <span>Fairness Audit Log</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OverviewVitalsTab;
