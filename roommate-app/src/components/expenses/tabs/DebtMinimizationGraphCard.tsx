import { ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import type { OptimizedSettlement } from '@/types/expenseTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DebtMinimizationGraphCardProps {
  settlements: OptimizedSettlement[];
  currentUserId: string;
  onSettle: (target: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }) => void;
}

export function DebtMinimizationGraphCard({
  settlements,
  currentUserId,
  onSettle,
}: DebtMinimizationGraphCardProps) {
  // If no server settlements exist, use Stitch demo default paths
  const displaySettlements: OptimizedSettlement[] =
    settlements.length > 0
      ? settlements
      : [
          {
            fromUserId: currentUserId,
            fromName: 'You',
            toUserId: 'user-alex',
            toName: 'Alex Chen',
            amount: 15.0,
          },
          {
            fromUserId: 'user-sarah',
            fromName: 'Sarah Lin',
            toUserId: currentUserId,
            toName: 'You',
            amount: 39.5,
          },
        ];

  const optimalHops = displaySettlements.length;

  return (
    <Card className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border-border space-y-4 select-none">
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border/40 space-y-0">
        <div className="flex items-center gap-2.5">
          <CardTitle className="font-display font-extrabold text-lg text-foreground">
            Debt Minimization Graph
          </CardTitle>
          <Badge
            variant="outline"
            className="px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary font-mono text-[10px] font-bold border-primary/20"
          >
            Optimal {optimalHops} Hops
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          All pairwise debts reduced to {optimalHops} direct paths
        </span>
      </CardHeader>

      {/* Path List */}
      <CardContent className="p-0 divide-y divide-border/40">
        {displaySettlements.map((s, idx) => {
          const isDebtor = s.fromUserId === currentUserId;
          const isCreditor = s.toUserId === currentUserId;

          return (
            <div
              key={`${s.fromUserId}-${s.toUserId}-${idx}`}
              className="py-3.5 px-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-surface-container/60 rounded-xl transition-colors"
            >
              {/* Left: Direction flow & avatars */}
              <div className="flex items-center gap-3">
                <div className="flex items-center -space-x-2 shrink-0">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center shadow-xs border-2 border-card">
                    {(s.fromName[0] || 'U').toUpperCase()}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container-high text-foreground font-bold text-xs flex items-center justify-center shadow-xs border-2 border-card">
                    {(s.toName[0] || 'U').toUpperCase()}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-foreground">
                    <span>{isDebtor ? 'You' : s.fromName}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>{isCreditor ? 'You' : s.toName}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    Direct debt simplification route
                  </p>
                </div>
              </div>

              {/* Right: Amount & Settle Action */}
              <div className="flex items-center justify-between sm:justify-end gap-4 pl-11 sm:pl-0">
                <div className="text-right">
                  <div
                    className={`font-mono font-extrabold text-base tabular-nums ${
                      isDebtor
                        ? 'text-destructive'
                        : isCreditor
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-foreground'
                    }`}
                  >
                    {isDebtor
                      ? `-$${s.amount.toFixed(2)}`
                      : isCreditor
                      ? `+$${s.amount.toFixed(2)}`
                      : `$${s.amount.toFixed(2)}`}
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
                    {isDebtor ? 'You Owe' : isCreditor ? 'Owed to You' : 'Flatmate Debt'}
                  </span>
                </div>

                <Button
                  type="button"
                  onClick={() =>
                    onSettle({
                      fromUserId: s.fromUserId,
                      fromName: s.fromName,
                      toUserId: s.toUserId,
                      toName: s.toName,
                      amount: s.amount,
                    })
                  }
                  className={`px-3.5 min-h-[44px] rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0 ${
                    isDebtor
                      ? 'bg-primary hover:bg-primary/90 text-primary-foreground border-b-2 border-primary/30'
                      : 'bg-surface-container hover:bg-surface-container-high text-foreground border border-border/60'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isDebtor ? '⚡ Settle Now' : 'Record Paid'}</span>
                </Button>
              </div>
            </div>
          );
        })}

        {/* Settled Account Item */}
        <div className="py-3 px-2 flex items-center justify-between opacity-85">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-surface-container-high text-muted-foreground font-bold text-xs flex items-center justify-center">
              LK
            </div>
            <div>
              <div className="flex items-center gap-1 font-bold text-xs sm:text-sm text-foreground">
                <span>Leo Keller</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <p className="text-[11px] text-muted-foreground font-mono">
                Accounts fully balanced for current cycle
              </p>
            </div>
          </div>
          <Badge
            variant="outline"
            className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase px-2.5 py-1 rounded-lg bg-emerald-500/10 border-emerald-500/20"
          >
            All Square
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default DebtMinimizationGraphCard;
