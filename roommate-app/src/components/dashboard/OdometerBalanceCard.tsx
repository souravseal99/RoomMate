import {
  Wallet,
  ArrowRight,
  Send,
  Building2,
  Zap,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface OdometerBalanceCardProps {
  expensesAmount?: number;
  onOpenSettleModal?: () => void;
}

export function OdometerBalanceCard({
  expensesAmount = 24.5,
  onOpenSettleModal,
}: OdometerBalanceCardProps) {
  const navigate = useNavigate();

  const isPositive = expensesAmount >= 0;
  const formattedVal = Math.abs(expensesAmount).toFixed(2);
  const digits = formattedVal.split('');

  const handleClaimSarah = () => {
    toast.success('Payment claim link sent to Sarah Lin ($39.50)!', {
      icon: <Send className="w-4 h-4 text-primary" />,
    });
  };

  return (
    <section
      aria-label="Active House Ledger & Financial Clarity"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs flex flex-col justify-between space-y-4 select-none"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
            <Wallet className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Active House Ledger
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-muted-foreground bg-surface-container border border-border px-2.5 py-0.5 rounded-md text-[11px] font-semibold">
            Oct 1 - 31 Cycle
          </span>
          <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded-md font-mono">
            Synced
          </span>
        </div>
      </div>

      {/* Monospace Split-Flap Net Readout Frame */}
      <div className="bg-surface-container border border-border rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground block font-mono">
              Personal Net Standing
            </span>
            <div className="flex items-center gap-2.5 mt-2">
              {/* Slotted Inset Mechanical Chamber */}
              <div className="flex items-center gap-1 bg-inset-cavity text-white p-1.5 rounded-lg shadow-inner border border-border/40">
                <span className="w-7 h-9 flex items-center justify-center bg-white/10 rounded text-emerald-400 font-mono font-bold text-lg shadow-xs">
                  {isPositive ? '+' : '-'}
                </span>
                <span className="w-7 h-9 flex items-center justify-center bg-white/10 rounded text-primary-fixed font-mono font-bold text-lg shadow-xs">
                  $
                </span>
                {digits.map((char, idx) => {
                  if (char === '.') {
                    return (
                      <span
                        key={`dot-${idx}`}
                        className="w-4 h-9 flex items-center justify-center text-white/50 font-mono font-bold text-lg"
                      >
                        .
                      </span>
                    );
                  }
                  return (
                    <span
                      key={`drum-${idx}`}
                      className="w-7 h-9 flex items-center justify-center bg-white/10 rounded text-white font-mono font-bold text-lg shadow-xs tabular-nums"
                    >
                      {char}
                    </span>
                  );
                })}
              </div>

              <div className="ml-1 flex flex-col">
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 font-mono">
                  {isPositive ? 'Net in Credit' : 'Net in Debt'}
                </span>
                <span className="font-mono text-[11px] text-muted-foreground mt-0.5">
                  Auto-split live
                </span>
              </div>
            </div>
          </div>

          {/* Quick Triggers */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenSettleModal}
              className="flex items-center justify-between gap-3 px-3.5 py-2 min-h-[44px] rounded-xl bg-primary text-primary-foreground font-semibold text-xs tracking-tight shadow-[0_2px_0_#9A3412] hover:bg-primary/90 active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim"
            >
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Settle with Alex</span>
              </span>
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white font-bold">
                $15.00
              </span>
            </button>

            <button
              type="button"
              onClick={handleClaimSarah}
              className="flex items-center justify-between gap-3 px-3.5 py-2 min-h-[44px] rounded-xl bg-tertiary text-tertiary-foreground font-semibold text-xs tracking-tight hover:bg-tertiary/90 active:scale-95 transition-all shadow-xs cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" />
                <span>Claim Sarah</span>
              </span>
              <span className="font-mono bg-black/20 px-2 py-0.5 rounded text-white font-bold">
                $39.50
              </span>
            </button>
          </div>
        </div>

        {/* Breakdown Sub-row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border/50 bg-card p-3 rounded-xl border">
          <div className="flex items-center justify-between pr-0 sm:pr-3 border-b sm:border-b-0 sm:border-r border-border/60 pb-2 sm:pb-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface-container border border-border flex items-center justify-center font-mono font-bold text-foreground text-xs">
                A
              </div>
              <div>
                <p className="font-semibold text-xs text-foreground tracking-tight">Alex Chen</p>
                <p className="text-muted-foreground text-[10px]">Whole Foods Haul</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-destructive font-bold text-xs block">- $15.00</span>
              <span className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground font-mono">
                Owed by You
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pl-0 sm:pl-3 pt-2 sm:pt-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center font-mono font-bold text-emerald-700 dark:text-emerald-300 text-xs">
                S
              </div>
              <div>
                <p className="font-semibold text-xs text-foreground tracking-tight">Sarah Lin</p>
                <p className="text-muted-foreground text-[10px]">Gigabit Fiber Net</p>
              </div>
            </div>
            <div className="text-right">
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs block">
                + $39.50
              </span>
              <span className="text-[9px] font-semibold tracking-wider uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                Owed to You
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Flatmate Tab Summary Snapshot */}
      <div className="p-3 bg-surface-container rounded-xl border border-border/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground flex items-center gap-1.5 font-mono">
            <Users className="w-3.5 h-3.5 text-primary" />
            Flatmate Tab Summary
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">Live Split</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Sourav */}
          <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-primary text-primary-foreground font-mono text-[9px] flex items-center justify-center shrink-0 font-bold">
                S
              </div>
              <div className="truncate">
                <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                  Sourav
                </p>
                <p className="text-[9px] text-primary font-semibold leading-tight uppercase font-mono">
                  Credit
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-primary text-[11px]">+$24.50</span>
          </div>

          {/* Sarah */}
          <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-destructive/15 text-destructive font-mono text-[9px] flex items-center justify-center shrink-0 font-bold">
                S
              </div>
              <div className="truncate">
                <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                  Sarah
                </p>
                <p className="text-[9px] text-destructive font-semibold leading-tight uppercase font-mono">
                  Owes
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-destructive text-[11px]">-$39.50</span>
          </div>

          {/* Alex */}
          <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-surface-container border border-border text-foreground font-mono text-[9px] flex items-center justify-center shrink-0 font-bold">
                A
              </div>
              <div className="truncate">
                <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                  Alex
                </p>
                <p className="text-[9px] text-primary font-semibold leading-tight uppercase font-mono">
                  Credit
                </p>
              </div>
            </div>
            <span className="font-mono font-bold text-primary text-[11px]">+$15.00</span>
          </div>

          {/* Leo */}
          <div className="p-2 rounded-lg bg-card flex items-center justify-between border border-border shadow-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded bg-surface-container text-muted-foreground font-mono text-[9px] flex items-center justify-center shrink-0 font-bold">
                L
              </div>
              <div className="truncate">
                <p className="font-semibold text-[11px] text-foreground leading-tight truncate">
                  Leo
                </p>
                <p className="text-[9px] text-muted-foreground font-semibold leading-tight uppercase font-mono">
                  Settled
                </p>
              </div>
            </div>
            <span className="font-mono text-muted-foreground text-[11px]">$0.00</span>
          </div>
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

        <div className="flex flex-col divide-y divide-border/60">
          {/* Bill 1: Nov Rent Tab */}
          <div className="py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center shrink-0">
                <Building2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-xs text-foreground leading-none tracking-tight">
                    Nov Rent Tab
                  </p>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] font-bold">
                    <span className="w-3 h-3 rounded-full bg-primary text-primary-foreground text-[7px] flex items-center justify-center font-bold">
                      S
                    </span>
                    Sourav (Payer)
                  </span>
                </div>
                <p className="text-muted-foreground text-[10px] mt-1">
                  Auto-draft scheduled Nov 1 · Chase Checking ••7102
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-foreground text-xs block">$800.00</span>
              <span className="font-mono text-[10px] text-muted-foreground block">$3,200 total</span>
            </div>
          </div>

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
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-container text-foreground font-mono text-[10px] font-bold">
                    <span className="w-3 h-3 rounded-full bg-surface-container-high text-foreground text-[7px] flex items-center justify-center font-bold">
                      A
                    </span>
                    Alex (••42)
                  </span>
                  <span className="text-[9px] font-semibold uppercase tracking-wider text-warning bg-warning/10 border border-warning/20 px-1.5 py-0.5 rounded font-mono">
                    Pending Review
                  </span>
                </div>
                <p className="text-muted-foreground text-[10px] mt-1">
                  Pending bill review · Split 4 ways
                </p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <span className="font-mono font-bold text-foreground text-xs block">$16.00</span>
              <span className="font-mono text-[10px] text-muted-foreground block">$64 total split</span>
            </div>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="p-3 rounded-xl bg-surface-container border border-border/80 flex flex-col gap-1.5 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground font-mono">
              Oct Household Budget
            </span>
            <span className="font-mono font-bold text-foreground">
              $1,420 <span className="text-muted-foreground font-normal">/ $1,800 spent</span>{' '}
              <span className="text-primary">(78%)</span>
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-surface-container-high border border-border/40 overflow-hidden flex">
            <div className="h-full bg-primary rounded-full" style={{ width: '78%' }} />
          </div>
        </div>
      </div>

      {/* Footer Link */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 font-mono border-t border-border/60">
        <span className="flex items-center gap-1.5 text-[11px]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Auto-balanced cycle · Next: Nov 1
        </span>
        <button
          type="button"
          onClick={() => navigate('/expenses')}
          className="inline-flex items-center gap-1 font-semibold text-primary hover:underline text-xs cursor-pointer min-h-[44px]"
        >
          <span>Full Expense History (18)</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
}

export default OdometerBalanceCard;
