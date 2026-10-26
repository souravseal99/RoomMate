import { Wallet, ArrowRight, Send, Building2, Zap, Users, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { BalanceEntry, OptimizedSettlement } from '@/types/expenseTypes';

interface OdometerBalanceCardProps {
  expensesAmount?: number;
  onOpenSettleModal?: (recipient?: { name: string; amount: number }) => void;
  balances?: BalanceEntry[];
  settlements?: OptimizedSettlement[];
  budgetSpent?: number;
  budgetTotal?: number;
}

export function OdometerBalanceCard({
  expensesAmount = 24.5,
  onOpenSettleModal,
  balances = [],
  budgetSpent = 1420,
  budgetTotal = 1800,
}: OdometerBalanceCardProps) {
  const navigate = useNavigate();

  const handleClaimSarah = () => {
    toast.success('Payment claim link sent to Sarah Lin ($39.50)!', {
      icon: <Send className="w-4 h-4 text-primary" />,
    });
  };

  const handlePayAlex = () => {
    if (onOpenSettleModal) {
      onOpenSettleModal({ name: 'Alex Chen', amount: 15.0 });
    } else {
      navigate('/expenses');
    }
  };

  const budgetPercent = Math.min(Math.round((budgetSpent / (budgetTotal || 1)) * 100), 100);

  return (
    <Card
      aria-label="Active House Ledger & Financial Clarity"
      className="rounded-2xl p-5 sm:p-6 border-border shadow-xs flex flex-col justify-between space-y-4 select-none bg-card"
    >
      {/* Top Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Active House Ledger
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="font-mono text-muted-foreground bg-surface-container border-border px-2.5 py-0.5 rounded-md text-[11px] font-semibold"
          >
            Oct 1 - 31 Cycle
          </Badge>
          <Badge
            variant="outline"
            className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/20 px-2 py-0.5 rounded-md font-mono"
          >
            Synced
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* DIRECT SETTLEMENTS (HIGH CONTRAST PEER DEBT ROWS) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground font-mono">
              Direct Settlements (2 Pending)
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Peer-to-peer Net</span>
          </div>

          <div className="space-y-2">
            {/* Peer 1: Alex Chen (You Owe) */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-9 h-9 rounded-xl bg-card border border-border/80 shrink-0">
                  <AvatarFallback className="rounded-xl font-mono font-bold text-foreground text-xs">
                    AC
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">
                      Alex Chen
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold uppercase tracking-wider text-destructive dark:text-terracotta bg-destructive/10 border-destructive/20 px-1.5 py-0.2 rounded font-mono"
                    >
                      You Owe
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate mt-0.5 font-mono">
                    Whole Foods Haul · Shared groceries
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <div className="text-left sm:text-right">
                  <span className="font-mono text-destructive dark:text-terracotta font-bold text-sm sm:text-base tabular-nums block leading-tight">
                    -$15.00
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground font-mono">
                    Owed by You
                  </span>
                </div>
                <Button
                  type="button"
                  onClick={handlePayAlex}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-tertiary hover:bg-tertiary/90 text-tertiary-foreground font-bold text-xs tracking-tight shadow-xs active:scale-95 transition-all cursor-pointer border-0"
                >
                  <Zap className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Pay $15.00</span>
                </Button>
              </div>
            </div>

            {/* Peer 2: Sarah Lin (Owes You) */}
            <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-3 min-w-0">
                <Avatar className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 shrink-0">
                  <AvatarFallback className="rounded-xl font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                    SL
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate">
                      Sarah Lin
                    </p>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20 px-1.5 py-0.2 rounded font-mono"
                    >
                      Owes You
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[11px] truncate mt-0.5 font-mono">
                    Gigabit Fiber Net · Utilities
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                <div className="text-left sm:text-right">
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-sm sm:text-base tabular-nums block leading-tight">
                    +$39.50
                  </span>
                  <span className="text-[9px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                    Owed to You
                  </span>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClaimSarah}
                  className="min-h-[44px] px-3.5 py-2 rounded-xl bg-card border-border hover:bg-surface-container-high text-foreground font-bold text-xs tracking-tight shadow-xs active:scale-95 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-primary stroke-[2.2]" />
                  <span>Request $39.50</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Flatmate Tab Summary Snapshot */}
        <div className="p-3 sm:p-3.5 bg-surface-container rounded-xl border border-border/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5 font-mono">
              <Users className="w-3.5 h-3.5 text-primary" />
              Flatmate Tab Summary
            </span>
            <span className="text-[10px] font-mono text-muted-foreground">Live Split</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {balances.length > 0 ? (
              balances.slice(0, 4).map((entry) => {
                const isCredit = entry.balance >= 0;
                const isZero = Math.abs(entry.balance) < 0.01;
                const statusLabel = isZero ? 'Settled' : isCredit ? 'Credit' : 'Owes';
                const formatted = isZero
                  ? '$0.00'
                  : `${isCredit ? '+' : '-'}$${Math.abs(entry.balance).toFixed(2)}`;

                return (
                  <div
                    key={entry.userId || entry.name}
                    className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Avatar
                        className={`w-5 h-5 rounded ${
                          isCredit
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-destructive/15 text-destructive'
                        }`}
                      >
                        <AvatarFallback className="rounded font-mono text-[9px] font-bold">
                          {entry.name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="truncate">
                        <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                          {entry.name}
                        </p>
                        <p
                          className={`text-[9px] font-semibold leading-tight uppercase font-mono ${
                            isZero
                              ? 'text-muted-foreground'
                              : isCredit
                                ? 'text-primary'
                                : 'text-destructive dark:text-terracotta'
                          }`}
                        >
                          {statusLabel}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-mono font-bold text-[11px] tabular-nums ${
                        isZero
                          ? 'text-muted-foreground'
                          : isCredit
                            ? 'text-primary'
                            : 'text-destructive dark:text-terracotta'
                      }`}
                    >
                      {formatted}
                    </span>
                  </div>
                );
              })
            ) : (
              <>
                {/* Sourav */}
                <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="w-5 h-5 rounded bg-primary text-primary-foreground">
                      <AvatarFallback className="rounded bg-primary text-primary-foreground font-mono text-[9px] font-bold">
                        S
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                        Sourav
                      </p>
                      <p className="text-[9px] text-primary font-semibold leading-tight uppercase font-mono">
                        Credit
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-primary text-[11px] tabular-nums">
                    {expensesAmount >= 0
                      ? `+$${expensesAmount.toFixed(2)}`
                      : `-$${Math.abs(expensesAmount).toFixed(2)}`}
                  </span>
                </div>

                {/* Sarah */}
                <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="w-5 h-5 rounded bg-destructive/15 text-destructive">
                      <AvatarFallback className="rounded bg-destructive/15 text-destructive font-mono text-[9px] font-bold">
                        S
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                        Sarah
                      </p>
                      <p className="text-[9px] text-destructive font-semibold leading-tight uppercase font-mono">
                        Owes
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-destructive text-[11px] tabular-nums">
                    -$39.50
                  </span>
                </div>

                {/* Alex */}
                <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="w-5 h-5 rounded bg-surface-container border border-border text-foreground">
                      <AvatarFallback className="rounded bg-surface-container font-mono text-[9px] font-bold text-foreground">
                        A
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                        Alex
                      </p>
                      <p className="text-[9px] text-primary font-semibold leading-tight uppercase font-mono">
                        Credit
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-primary text-[11px] tabular-nums">
                    +$15.00
                  </span>
                </div>

                {/* Leo */}
                <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Avatar className="w-5 h-5 rounded bg-surface-container text-muted-foreground">
                      <AvatarFallback className="rounded bg-surface-container font-mono text-[9px] font-bold text-muted-foreground">
                        L
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                        Leo
                      </p>
                      <p className="text-[9px] text-muted-foreground font-semibold leading-tight uppercase font-mono">
                        Settled
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-muted-foreground text-[11px] tabular-nums">
                    $0.00
                  </span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* UPCOMING SHARED RENT / BILLS */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-primary" />
              <span className="text-[11px] font-semibold tracking-wider uppercase text-foreground font-mono">
                Upcoming Shared Bills
              </span>
            </div>
            <span className="font-mono text-[11px] text-muted-foreground">Split evenly 4 ways</span>
          </div>

          <div className="flex flex-col">
            {/* Bill 1: Nov Rent Tab */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-xs text-foreground leading-none tracking-tight">
                      Nov Rent Tab
                    </p>
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold"
                    >
                      <span className="w-3 h-3 rounded-full bg-primary text-primary-foreground text-[7px] flex items-center justify-center font-bold">
                        S
                      </span>
                      Sourav (Payer)
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[10px] mt-1 font-mono">
                    Auto-draft scheduled Nov 1 · Chase Checking ••7102
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-foreground text-xs block tabular-nums">
                  $800.00
                </span>
                <span className="font-mono text-[10px] text-muted-foreground block tabular-nums">
                  $3,200 total
                </span>
              </div>
            </div>

            <Separator className="bg-border/60" />

            {/* Bill 2: ConEd Electric */}
            <div className="py-2.5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface-container border border-border text-terracotta flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-xs text-foreground leading-none tracking-tight">
                      ConEd Electric
                    </p>
                    <Badge
                      variant="outline"
                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-foreground border-border font-mono text-[10px] font-bold"
                    >
                      <span className="w-3 h-3 rounded-full bg-surface-container-high text-foreground text-[7px] flex items-center justify-center font-bold">
                        A
                      </span>
                      Alex (••42)
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] font-semibold uppercase tracking-wider text-warning bg-warning/10 border-warning/20 px-1.5 py-0.5 rounded font-mono"
                    >
                      Pending Review
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-[10px] mt-1 font-mono">
                    Pending bill review · Split 4 ways
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-foreground text-xs block tabular-nums">
                  $16.00
                </span>
                <span className="font-mono text-[10px] text-muted-foreground block tabular-nums">
                  $64 total split
                </span>
              </div>
            </div>
          </div>

          {/* Budget Progress Bar */}
          <div className="p-3 rounded-xl bg-surface-container border border-border/80 flex flex-col gap-1.5 mt-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground font-mono">
                Oct Household Budget
              </span>
              <span className="font-mono font-bold text-foreground tabular-nums">
                ${budgetSpent.toLocaleString()}{' '}
                <span className="text-muted-foreground font-normal">
                  / ${budgetTotal.toLocaleString()} spent
                </span>{' '}
                <span className="text-primary font-bold">({budgetPercent}%)</span>
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-surface-container-high border border-border/40 overflow-hidden flex">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${budgetPercent}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 font-mono border-t border-border/60">
        <span className="flex items-center gap-1.5 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Auto-balanced cycle · Next: Nov 1
        </span>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary hover:bg-primary/5 text-xs p-0 h-auto cursor-pointer min-h-[44px]"
        >
          <span>Full Expense History (18)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Button>
      </div>
    </Card>
  );
}

export default OdometerBalanceCard;
