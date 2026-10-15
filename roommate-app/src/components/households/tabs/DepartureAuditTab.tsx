import { useState, useMemo } from 'react';
import { AlertTriangle, CheckSquare, Square, LogOut, Trash2, CheckCircle2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { useExpenseBalancesQuery } from '@/hooks/queries/useExpenseQueries';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DepartureAuditTabProps {
  onOpenLeaveModal?: () => void;
  onOpenDeleteModal?: () => void;
}

export function DepartureAuditTab({
  onOpenLeaveModal,
  onOpenDeleteModal,
}: DepartureAuditTabProps) {
  const { activeHousehold, activeHouseholdId, householdMembers } = useHousehold();
  const { email, name } = useAuth();

  const { data: balancesData } = useExpenseBalancesQuery(activeHouseholdId);
  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);

  // Match current user
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
  const isAdmin = currentMember?.role === 'ADMIN';

  // 1. Balance verification
  const userBalance = useMemo(() => {
    if (!balancesData?.balances || balancesData.balances.length === 0) return 0;
    const found = balancesData.balances.find(
      (b) =>
        (currentUserId && b.userId === currentUserId) ||
        (name && b.name?.toLowerCase() === name.toLowerCase())
    );
    return found ? found.balance : 0;
  }, [balancesData, currentUserId, name]);

  const isFinancialSettled = Math.abs(userBalance) < 0.01;

  // 2. Pending chores verification
  const myPendingChores = useMemo(() => {
    if (!currentUserId) return [];
    return chores.filter((c) => c.assignedToId === currentUserId && !c.completed);
  }, [chores, currentUserId]);

  const areChoresCleared = myPendingChores.length === 0;

  // Manual checklist states
  const [manualChecks, setManualChecks] = useState<Record<string, boolean>>({
    keys: false,
    pantry: false,
  });

  const toggleManualCheck = (key: 'keys' | 'pantry') => {
    setManualChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleInitiateMoveOut = () => {
    if (onOpenLeaveModal) {
      onOpenLeaveModal();
    } else {
      toast.info('Departure pre-flight verified. Opening leave dialogue.');
    }
  };

  const handleInitiateDissolve = () => {
    if (!isAdmin) {
      toast.error('Only household admins can dissolve this living space.');
      return;
    }
    if (onOpenDeleteModal) {
      onOpenDeleteModal();
    } else {
      toast.warning('Admin dissolution authorization required.');
    }
  };

  const currencySymbol = activeHousehold?.settings?.currency === 'EUR' ? '€' : '$';

  return (
    <Card className="bg-card rounded-2xl shadow-xs border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none overflow-hidden p-5 sm:p-6">
      {/* Header */}
      <CardHeader className="p-0 border-b border-border/60 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="font-bold text-lg text-foreground font-display tracking-tight">
              Tenant Departure &amp; Pre-Flight Audit
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Live checks for moving out cleanly or dissolving the household.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border-destructive/20 font-mono text-[10px] font-bold uppercase self-start"
          >
            Audit Checklist
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Moving Out Step-by-Step Checklist (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <span className="font-bold text-xs text-foreground font-display">
            Your Departure Pre-Flight (Moving out of {activeHousehold?.name || 'Space'})
          </span>

          <div className="bg-muted/40 p-4 rounded-xl border border-border/80 flex flex-col gap-3">
            {/* Item 1: Financial Settlement (Live) */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container/60 border border-border/60">
              {isFinancialSettled ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-foreground">
                    1. Financial Ledger Settlement
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[9px] font-bold uppercase ${
                      isFinancialSettled
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-warning/10 text-warning border-warning/20'
                    }`}
                  >
                    {isFinancialSettled ? 'Resolved' : 'Pending Settle'}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-mono">
                  {isFinancialSettled
                    ? 'All debts are fully settled ($0.00 balance).'
                    : userBalance > 0
                    ? `You are owed ${currencySymbol}${userBalance.toFixed(2)} by flatmates before leaving.`
                    : `You owe ${currencySymbol}${Math.abs(userBalance).toFixed(2)} to flatmates. Please settle up.`}
                </span>
              </div>
            </div>

            {/* Item 2: Chore Clearances (Live) */}
            <div className="flex items-start gap-3 p-2.5 rounded-lg bg-surface-container/60 border border-border/60">
              {areChoresCleared ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs text-foreground">
                    2. Duty &amp; Chore Clearances
                  </span>
                  <Badge
                    variant="outline"
                    className={`font-mono text-[9px] font-bold uppercase ${
                      areChoresCleared
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : 'bg-primary/10 text-primary border-primary/20'
                    }`}
                  >
                    {areChoresCleared ? 'Cleared' : `${myPendingChores.length} Incomplete`}
                  </Badge>
                </div>
                <span className="text-[11px] text-muted-foreground leading-relaxed mt-0.5 font-mono">
                  {areChoresCleared
                    ? 'You have 0 pending assigned chores in this space.'
                    : `Complete or reassign your ${myPendingChores.length} scheduled duty items.`}
                </span>
              </div>
            </div>

            {/* Item 3: Key Fob Handover (Manual) */}
            <button
              type="button"
              onClick={() => toggleManualCheck('keys')}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left cursor-pointer group min-h-[44px]"
            >
              {manualChecks.keys ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  3. Physical Key Fob &amp; Remote Handover
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Return apartment keys, garage clickers, and mail keys to the host admin.
                </span>
              </div>
            </button>

            {/* Item 4: Pantry & Storage Clear-Out (Manual) */}
            <button
              type="button"
              onClick={() => toggleManualCheck('pantry')}
              className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-muted/60 transition-colors text-left cursor-pointer group min-h-[44px]"
            >
              {manualChecks.pantry ? (
                <CheckSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              )}
              <div className="flex flex-col">
                <span className="font-bold text-xs text-foreground group-hover:text-primary transition-colors">
                  4. Pantry &amp; Storage Clear-Out
                </span>
                <span className="text-[11px] text-muted-foreground leading-relaxed">
                  Verify personal food, refrigerator shelves, and communal lockers are emptied.
                </span>
              </div>
            </button>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <Button
              type="button"
              variant="destructive"
              onClick={handleInitiateMoveOut}
              className="px-5 min-h-[44px] rounded-full font-bold text-xs shadow-xs flex items-center gap-2 cursor-pointer active:scale-95 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Initiate Move-Out</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Admin Zone: Household Dissolution (5 cols) */}
        <div className="lg:col-span-5 bg-destructive/5 border border-destructive/20 p-5 rounded-xl flex flex-col gap-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-bold text-xs font-display">
              Admin Zone: Household Dissolution
            </span>
          </div>

          <p className="text-[11px] text-muted-foreground leading-relaxed">
            When all flatmates vacate simultaneously and the shared household is dissolved.
          </p>

          <Card className="bg-card p-3 rounded-lg border-border/80 flex flex-col gap-1 text-[11px] text-muted-foreground shadow-none">
            <span className="font-bold text-destructive">Cascade Archive Action:</span>
            <span>• Permanently removes access for all {householdMembers.length} residents</span>
            <span>• Archives shared expenses and shopping items</span>
            <span>• Invalidates household invite passkey</span>
          </Card>

          <Button
            type="button"
            variant="outline"
            onClick={handleInitiateDissolve}
            disabled={!isAdmin}
            className="w-full mt-2 bg-destructive/10 hover:bg-destructive text-destructive hover:text-destructive-foreground min-h-[44px] rounded-xl font-bold text-xs transition-colors border-destructive/30 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isAdmin ? 'Dissolve Household' : 'Admin Authorization Required'}</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default DepartureAuditTab;

