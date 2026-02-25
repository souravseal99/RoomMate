import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import expenseApi, { BalanceEntry, Settlement } from "@/api/expenseApi";
import { formatCurrency } from "@/utils/utils";

interface BalanceSummaryProps {
  householdId: string | undefined;
  refreshKey?: number;
}

export default function BalanceSummary({ householdId, refreshKey }: BalanceSummaryProps) {
  const [balances, setBalances] = useState<BalanceEntry[]>([]);
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBalances = async () => {
      if (!householdId) {
        setBalances([]);
        setSettlements([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await expenseApi().fetchBalances(householdId);
        if (data) {
          setBalances(data.balances);
          setSettlements(data.settlements);
        }
      } catch (error) {
        console.error("Failed to fetch balances:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBalances();
  }, [householdId, refreshKey]);

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
            <ul className="space-y-1">
              {settlements.map((settlement, index) => (
                <li key={index} className="text-sm">
                  <span className="font-medium">{settlement.fromName}</span>{" "}
                  owes{" "}
                  <span className="font-medium">{settlement.toName}</span>{" "}
                  <span className="font-semibold text-green-600">
                    {formatCurrency(settlement.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">All settled up!</p>
          )}
        </div>

        {/* All members balances */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">
            All members
          </h3>
          <ul className="space-y-1">
            {balances.map((balance) => (
              <li key={balance.userId} className="flex justify-between text-sm">
                <span>{balance.name}</span>
                <span
                  className={`font-medium ${
                    balance.balance > 0
                      ? "text-green-600"
                      : balance.balance < 0
                      ? "text-red-600"
                      : "text-gray-500"
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
