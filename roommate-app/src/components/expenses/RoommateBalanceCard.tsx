import { ArrowUpRight, ArrowDownLeft, Check, CreditCard } from 'lucide-react';
import { formatCurrency, getInitials } from '@/utils/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
    <Card
      className={`rounded-2xl p-4 flex flex-col justify-between gap-3 border-border shadow-xs transition-all select-none ${
        isSettled
          ? 'bg-card/70 opacity-80'
          : 'bg-card hover:border-border/80 hover:-translate-y-0.5'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border border-border shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={roommateName} />}
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="text-sm font-semibold text-foreground tracking-tight flex items-center gap-1.5">
              {roommateName}
              {isCurrentUser && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 rounded text-muted-foreground font-medium">
                  You
                </Badge>
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
            <Badge variant="outline" className="w-6 h-6 p-0 rounded-full bg-primary/10 text-primary flex items-center justify-center border-primary/20">
              <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </Badge>
          )}
          {youOwe && (
            <Badge variant="outline" className="w-6 h-6 p-0 rounded-full bg-destructive/10 text-destructive flex items-center justify-center border-destructive/20">
              <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
            </Badge>
          )}
          {isSettled && (
            <Badge variant="outline" className="w-6 h-6 p-0 rounded-full bg-surface-container text-muted-foreground flex items-center justify-center border-border">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </Badge>
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
          className="w-full min-h-[44px] text-xs font-bold border-border bg-surface-container-low hover:bg-surface-container text-foreground cursor-pointer flex items-center justify-center gap-1.5 rounded-xl active:scale-98"
        >
          <CreditCard className="w-3.5 h-3.5 text-primary" />
          {isSettling ? 'Settling...' : `Settle ${formatCurrency(debtAmount)}`}
        </Button>
      ) : owesYou ? (
        <div className="w-full py-2 min-h-[44px] flex items-center justify-center text-center text-[11px] text-muted-foreground font-medium bg-surface-container-low/50 rounded-xl border border-border/50">
          Awaiting roommate payment
        </div>
      ) : (
        <div className="w-full py-2 min-h-[44px] flex items-center justify-center text-center text-[11px] text-muted-foreground/80 font-medium">
          Zero pending debt
        </div>
      )}
    </Card>
  );
}

export default RoommateBalanceCard;
