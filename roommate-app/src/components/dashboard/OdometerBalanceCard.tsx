import { useMemo } from 'react';
import { Wallet, ArrowRight, Building2, Zap, Users, Calendar, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { BalanceEntry, OptimizedSettlement, RecentBill } from '@/types/expenseTypes';

interface OdometerBalanceCardProps {
  expensesAmount?: number;
  onOpenSettleModal?: (recipient?: { name: string; amount: number; toUserId?: string }) => void;
  balances?: BalanceEntry[];
  settlements?: OptimizedSettlement[];
  recentBills?: RecentBill[];
  budgetSpent?: number;
  budgetTotal?: number;
}

export function OdometerBalanceCard({
  balances = [],
  recentBills = [],
  budgetSpent = 0,
  budgetTotal = 1800,
  onOpenSettleModal,
}: OdometerBalanceCardProps) {
  const navigate = useNavigate();

  // Active Billing Cycle & Formatted Current Date (e.g. "1st Nov(11), 26" & "Nov 1 - 30 Cycle")
  const billingCycle = useMemo(() => {
    const now = new Date();
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const month = monthNames[now.getMonth()];
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const day = now.getDate();
    const getOrdinalSuffix = (d: number) => {
      if (d >= 11 && d <= 13) return 'th';
      switch (d % 10) {
        case 1:
          return 'st';
        case 2:
          return 'nd';
        case 3:
          return 'rd';
        default:
          return 'th';
      }
    };

    const currentDate = `${day}${getOrdinalSuffix(day)} ${month}(${now.getMonth() + 1}), ${String(now.getFullYear()).slice(-2)}`;

    return {
      currentDate,
      range: `${month} 1 - ${lastDay} Cycle`,
    };
  }, []);

  const currentMonthName = useMemo(() => {
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return monthNames[new Date().getMonth()].toUpperCase();
  }, []);

  const handleNudge = (name: string, amount: number) => {
    const absAmount = Math.abs(amount).toFixed(2);
    toast.success(`Payment nudge sent to ${name} ($${absAmount})!`, {
      icon: <Bell className="w-4 h-4 text-primary" />,
    });
  };

  const budgetPercent = Math.min(Math.round(((budgetSpent || 0) / (budgetTotal || 1)) * 100), 100);

  // Consolidated Flatmates list directly from database balances
  const flatmatesList = useMemo(() => {
    return balances.map((b) => ({
      userId: b.userId,
      name: b.name || 'Roommate',
      initial: (b.name || 'R').charAt(0).toUpperCase(),
      balance: b.balance,
    }));
  }, [balances]);

  return (
    <Card
      aria-label="Active House Ledger & Financial Clarity"
      className="rounded-2xl p-5 sm:p-6 border-border shadow-xs flex flex-col gap-4 bg-card select-none"
    >
      {/* 1. Top Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xl tracking-widest font-semibold tracking-wider uppercase text-foreground font-mono">
            House Ledger
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-muted-foreground bg-muted/40 border-border px-2.5 py-0.5 rounded-md text-[11px] font-semibold tracking-tight shadow-xs"
          >
            <span className="tabular-nums">{billingCycle.currentDate}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* 2. FLATMATE TAB SUMMARY (4-CARD BALANCED GRID) */}
        <div className="p-3 sm:p-3.5 bg-muted/30 rounded-xl border border-border/70 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5 font-sans">
              <Users className="w-3.5 h-3.5 text-primary" />
              Flatmate Tab Summary
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Live Split</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-stretch">
            {flatmatesList.length === 0 ? (
              <div className="py-6 px-4 text-center rounded-lg bg-card/60 border border-dashed border-border col-span-full">
                <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1.5 opacity-60" />
                <p className="text-xs font-bold text-foreground font-sans">
                  No roommate balances yet
                </p>
                <p className="text-[11px] text-muted-foreground font-sans mt-0.5">
                  Share your household invite code or log an expense to begin splitting.
                </p>
              </div>
            ) : (
              flatmatesList.map((entry) => {
                const isCredit = entry.balance > 0.005;
                const isOwes = entry.balance < -0.005;
                const isZero = !isCredit && !isOwes;
                const statusLabel = isZero ? 'SETTLED' : isCredit ? 'CREDIT' : 'OWES';
                const formatted = isZero
                  ? '$0.00'
                  : `${isCredit ? '+' : '-'}$${Math.abs(entry.balance).toFixed(2)}`;

                return (
                  <div
                    key={entry.userId || entry.name}
                    className={`p-2.5 rounded-lg bg-card border border-border/80 shadow-xs flex flex-col justify-between transition-all ${
                      isOwes ? 'gap-2 border-destructive/20' : 'justify-center min-h-[68px]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 w-full">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Avatar
                          className={`w-6 h-6 rounded-md shrink-0 flex items-center justify-center ${
                            isCredit
                              ? 'bg-primary text-primary-foreground font-bold'
                              : isOwes
                                ? 'bg-primary/15 text-primary border border-primary/30 font-bold'
                                : 'bg-muted text-muted-foreground border border-border/60'
                          }`}
                        >
                          <AvatarFallback className="rounded font-mono text-[10px] font-bold">
                            {entry.initial}
                          </AvatarFallback>
                        </Avatar>
                        <div className="truncate">
                          <p className="font-bold text-[11px] sm:text-xs text-foreground leading-tight truncate font-sans">
                            {entry.name}
                          </p>
                          <p
                            className={`text-[9px] font-bold leading-tight uppercase font-sans ${
                              isZero ? 'text-muted-foreground' : 'text-primary'
                            }`}
                          >
                            {statusLabel}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-[11px] sm:text-xs tabular-nums shrink-0 ${
                          isZero ? 'text-muted-foreground' : 'text-primary'
                        }`}
                      >
                        {formatted}
                      </span>
                    </div>

                    {isOwes && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (onOpenSettleModal) {
                            onOpenSettleModal({
                              name: entry.name,
                              amount: Math.abs(entry.balance),
                              toUserId: entry.userId,
                            });
                          } else {
                            handleNudge(entry.name, entry.balance);
                          }
                        }}
                        className="w-full min-h-[28px] h-7 py-1 px-1.5 rounded-md bg-muted/20 hover:bg-muted border border-border text-foreground font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer"
                      >
                        <Bell className="w-3 h-3 text-primary" />
                        <span>Settle / Nudge</span>
                      </Button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 3. UPCOMING SHARED BILLS */}
        <div className="space-y-2 pt-0.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-bold tracking-wider uppercase text-foreground font-sans">
                Upcoming Shared Bills
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">
              {recentBills.length > 0 ? `Latest ${recentBills.length} recorded` : 'Live Split'}
            </span>
          </div>

          <div className="flex flex-col">
            {recentBills.length === 0 ? (
              <div className="py-4 px-3 text-center rounded-lg bg-muted/15 border border-dashed border-border/70 my-1">
                <p className="text-xs text-muted-foreground font-sans">
                  No shared bills logged for this cycle yet
                </p>
              </div>
            ) : (
              recentBills.map((bill, idx) => (
                <div key={bill.id || idx}>
                  <div className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-xs">
                        {bill.description.toLowerCase().includes('electric') ||
                        bill.description.toLowerCase().includes('util') ? (
                          <Zap className="w-4 h-4 fill-current" />
                        ) : (
                          <Building2 className="w-4 h-4 stroke-[2.2]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-xs sm:text-[13px] text-foreground leading-none tracking-tight font-sans">
                            {bill.description}
                          </p>
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[11px] font-medium font-sans">
                            <span className="w-3.5 h-3.5 rounded-full bg-primary text-primary-foreground text-[8px] font-bold flex items-center justify-center">
                              {bill.payerInitial}
                            </span>
                            <span>{bill.payerName} (Payer)</span>
                          </span>
                        </div>
                        <p className="text-muted-foreground text-xs mt-1 font-sans">
                          Auto-split {bill.splitCount} ways
                          {bill.createdAt
                            ? ` · ${new Date(bill.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-mono font-bold text-foreground text-xs sm:text-[13px] block tabular-nums">
                        ${bill.userShare.toFixed(2)}
                      </span>
                      <span className="font-mono text-[10px] text-muted-foreground block tabular-nums">
                        ${bill.totalAmount.toLocaleString()} total
                      </span>
                    </div>
                  </div>
                  {idx < recentBills.length - 1 && <Separator className="bg-border/60" />}
                </div>
              ))
            )}
          </div>
        </div>

        {/* 4. HOUSEHOLD BUDGET PROGRESS */}
        <div className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border/70 flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold tracking-wider uppercase text-muted-foreground font-sans">
              {currentMonthName} Household Budget
            </span>
            <span className="font-mono font-bold text-foreground tabular-nums text-xs sm:text-[13px]">
              ${budgetSpent.toLocaleString()}{' '}
              <span className="text-muted-foreground font-normal">
                / ${budgetTotal.toLocaleString()} spent
              </span>{' '}
              <span className="text-primary font-bold">({budgetPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-muted border border-border/40 overflow-hidden flex">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${budgetPercent}%` }}
            />
          </div>
        </div>
      </CardContent>

      {/* 5. FOOTER LINK & CYCLE NOTE */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 font-mono border-t border-border/60">
        <span className="text-[11px] text-muted-foreground font-mono">{billingCycle.range}</span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center gap-1.5 font-bold text-primary hover:text-primary hover:bg-primary/5 text-xs p-0 h-auto min-h-[36px] cursor-pointer"
        >
          <span>Full Expense History (18)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export default OdometerBalanceCard;
