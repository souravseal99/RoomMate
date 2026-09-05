import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import expenseApi, { type BalanceEntry, type Settlement } from '@/api/expenseApi';
import { formatCurrency } from '@/utils/utils';
import { getCurrentUserId } from '@/utils/jwt';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { CreditCard, Users, ArrowRightLeft } from 'lucide-react';

interface BalanceSummaryProps {
  householdId: string | undefined;
  refreshKey?: number;
}

export default function BalanceSummary({ householdId, refreshKey }: BalanceSummaryProps) {
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSettling, setIsSettling] = useState<string | null>(null);

  const ExpenseApi = useMemo(expenseApi, []);
  const currentUserId = useMemo(() => getCurrentUserId(), []);

  const fetchBalances = async () => {
    if (!householdId) {
      setBalances([]);
      setSettlements([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await ExpenseApi.fetchBalances(householdId);
      if (data) {
        setBalances(data.balances);
        setSettlements(data.settlements);
      }
    } catch (error) {
      console.error('Failed to fetch balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [householdId, refreshKey, ExpenseApi]);

  const handleSettle = async (settlement: Settlement) => {
    if (!householdId || !currentUserId) return;

    if (settlement.fromUserId !== currentUserId) {
      toast.error('You can only settle your own debts', {
        position: 'top-center',
      });
      return;
    }

    setIsSettling(settlement.fromUserId + settlement.toUserId);
    try {
      const response = await ExpenseApi.createSettlement({
        fromUserId: settlement.fromUserId,
        toUserId: settlement.toUserId,
        householdId: householdId,
        amount: settlement.amount,
      });

      if (response && response.status === 201) {
        toast.success('Settlement recorded successfully!', {
          position: 'top-center',
        });
        fetchBalances();
      } else {
        toast.error('Failed to record settlement', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Error settling:', error);
      toast.error('Failed to record settlement', {
        position: 'top-center',
      });
    } finally {
      setIsSettling(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-card border-border shadow-xs">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border shadow-xs text-foreground">
      <CardHeader className="border-b border-border/40 pb-3">
        <CardTitle className="text-base font-bold flex items-center gap-2 text-foreground">
          <CreditCard className="w-4 h-4 text-primary-container" />
          Balance Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Who owes whom section */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <ArrowRightLeft className="w-3.5 h-3.5 text-primary-container" /> Who owes whom
          </h3>
          {settlements.length > 0 ? (
            <ul className="space-y-2.5">
              {settlements.map((settlement, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm bg-background border border-border/60 rounded-md p-2.5"
                >
                  <div className="text-foreground">
                    <span className="font-semibold text-foreground">{settlement.fromName}</span> owes{' '}
                    <span className="font-semibold text-foreground">{settlement.toName}</span>{' '}
                    <span className="font-bold text-primary-container ml-1">
                      {formatCurrency(settlement.amount)}
                    </span>
                  </div>
                  {settlement.fromUserId === currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 h-7 px-3 text-xs font-bold border-border bg-card hover:bg-card/80 cursor-pointer"
                      onClick={() => handleSettle(settlement)}
                      disabled={isSettling === settlement.fromUserId + settlement.toUserId}
                    >
                      {isSettling === settlement.fromUserId + settlement.toUserId
                        ? 'Settling...'
                        : 'Settle'}
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 bg-background border border-border/40 rounded-md text-xs text-muted-foreground italic">
              All settled up! No pending debts.
            </div>
          )}
        </div>

        {/* All members balances */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-tertiary" /> All members net balances
          </h3>
          <ul className="space-y-2">
            {balances.map((balance) => (
              <li
                key={balance.userId}
                className="flex items-center justify-between text-sm py-1 border-b border-border/30 last:border-0"
              >
                <span className="font-medium text-foreground">{balance.name}</span>
                <span
                  className={`font-semibold ${
                    balance.balance > 0
                      ? 'text-emerald-700 font-bold'
                      : balance.balance < 0
                        ? 'text-destructive font-bold'
                        : 'text-muted-foreground'
                  }`}
                >
                  {balance.balance > 0
                    ? `+${formatCurrency(balance.balance)}`
                    : formatCurrency(balance.balance)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
