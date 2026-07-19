import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import expenseApi, { type BalanceEntry, type Settlement } from '@/api/expenseApi';
import { formatCurrency } from '@/utils/utils';
import { getCurrentUserId } from '@/utils/jwt';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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

    // Only allow settling own debts
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
        // Refresh balances after settlement
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
      <Card className="mx-3 mt-6">
        <CardHeader>
          <CardTitle>Balance Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-3 mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Who owes whom section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Who owes whom</h3>
          {settlements.length > 0 ? (
            <ul className="space-y-2">
              {settlements.map((settlement, index) => (
                <li key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium">{settlement.fromName}</span> owes{' '}
                    <span className="font-medium">{settlement.toName}</span>{' '}
                    <span className="font-semibold text-green-600">
                      {formatCurrency(settlement.amount)}
                    </span>
                  </div>
                  {settlement.fromUserId === currentUserId && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="ml-2 h-7 text-xs"
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
            <p className="text-sm text-gray-500">All settled up!</p>
          )}
        </div>

        {/* All members balances */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">All members</h3>
          <ul className="space-y-1">
            {balances.map((balance) => (
              <li key={balance.userId} className="flex justify-between text-sm">
                <span>{balance.name}</span>
                <span
                  className={`font-medium ${
                    balance.balance > 0
                      ? 'text-green-600'
                      : balance.balance < 0
                        ? 'text-red-600'
                        : 'text-gray-500'
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
