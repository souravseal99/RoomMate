import { ArrowUpRight, ArrowDownLeft, Check, CreditCard } from 'lucide-react';
import { formatCurrency, getInitials } from '@/utils/utils';
import { Button } from '@/components/ui/button';
import type { OptimizedSettlement } from '@/types/expenseTypes';

interface RoommateBalanceCardProps {
  roommateId: string;
  roommateName: string;
  avatarUrl?: string;
  directDebtWithCurrentUser: number; // Positive = owes current user, Negative = current user owes them, 0 = settled
  settlementDetail?: OptimizedSettlement;
  isCurrentUser: boolean;
  onSettle: (settlement: {
    fromUserId: string;
    fromName: string;
    toUserId: string;
    toName: string;
    amount: number;
  }) => void;
  isSettling?: boolean;
}

export function RoommateBalanceCard({
  roommateId,
  roommateName,
  avatarUrl,
  directDebtWithCurrentUser,
  settlementDetail,
  isCurrentUser,
  onSettle,
  isSettling,
}: RoommateBalanceCardProps) {
  const owesYou = directDebtWithCurrentUser > 0.01;
  const youOwe = directDebtWithCurrentUser < -0.01;
  const isSettled = !owesYou && !youOwe;

  const debtAmount = Math.abs(directDebtWithCurrentUser);
  const initials = getInitials(roommateName);

  const canSettleDirectly = youOwe && !isCurrentUser;

  return (
    <div
      className={`rounded-xl p-4 flex flex-col justify-between gap-3 border border-border shadow-xs transition-all ${
        isSettled
          ? 'bg-surface-container-lowest/70 opacity-80'
          : 'bg-surface-container-lowest hover:border-border/80 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {avatarUrl ? (
            <div className="w-10 h-10 rounded-full border border-border overflow-hidden shrink-0">
              <img src={avatarUrl} alt={roommateName} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
              {initials}
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
              {roommateName}
              {isCurrentUser && (
                <span className="text-[10px] bg-surface-container px-1.5 py-0.2 rounded text-muted-foreground font-medium">
                  You
                </span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {owesYou && (
                <>
                  Owes you <span className="text-primary font-bold">{formatCurrency(debtAmount)}</span>
                </>
              )}
              {youOwe && (
                <>
                  You owe <span className="text-destructive font-bold">{formatCurrency(debtAmount)}</span>
                </>
              )}
              {isSettled && <span className="text-muted-foreground italic">All settled up</span>}
            </p>
          </div>
        </div>

        {/* Directional Indicator Badge */}
        <div className="shrink-0">
          {owesYou && (
            <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          )}
          {youOwe && (
            <span className="w-6 h-6 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20">
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          )}
          {isSettled && (
            <span className="w-6 h-6 rounded-full bg-surface-container text-muted-foreground flex items-center justify-center border border-border">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </span>
          )}
        </div>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            owesYou ? 'bg-primary' : youOwe ? 'bg-destructive' : 'bg-surface-container'
          }`}
          style={{ width: isSettled ? '0%' : `${Math.min(Math.max((debtAmount / 2000) * 100, 20), 100)}%` }}
        />
      </div>

      {/* Action Button */}
      {canSettleDirectly ? (
        <Button
          variant="outline"
          size="sm"
          disabled={isSettling}
          onClick={() => {
            onSettle({
              fromUserId: settlementDetail?.fromUserId || '',
              fromName: 'You',
              toUserId: roommateId,
              toName: roommateName,
              amount: debtAmount,
            });
          }}
          className="w-full h-8 text-xs font-bold border-border bg-surface-container-low hover:bg-surface-container text-foreground cursor-pointer flex items-center justify-center gap-1.5 rounded-lg active:scale-98"
        >
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          {isSettling ? 'Settling...' : `Settle ${formatCurrency(debtAmount)}`}
        </Button>
      ) : owesYou ? (
        <div className="w-full py-1.5 text-center text-[11px] text-muted-foreground font-medium bg-surface-container-low/50 rounded-lg border border-border/50">
          Awaiting roommate payment
        </div>
      ) : (
        <div className="w-full py-1.5 text-center text-[11px] text-muted-foreground/80 font-medium">
          Zero pending debt
        </div>
      )}
    </div>
  );
}
