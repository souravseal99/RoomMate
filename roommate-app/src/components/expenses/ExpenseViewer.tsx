import { Trash2Icon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { dateFormatterUtc, formatCurrency } from '@/utils/utils';
import useExpense from '@/hooks/useExpense';
import ExpenseTableSkeleton from './ExpenseTableSkeleton';
import { useEffect, useState, useMemo } from 'react';
import expenseApi from '@/api/expenseApi';
import type { SettlementResponse } from '@/types/expenseTypes';
import useHousehold from '@/hooks/useHousehold';

type ExpenseViewerProps = {
  handleDeleteExpense: (expenseId: string) => Promise<void>;
};

function ExpenseViewer({ handleDeleteExpense }: ExpenseViewerProps) {
  const { expenses, isLoading } = useExpense();
  const { selectedHousehold } = useHousehold();
  const [settlements, setSettlements] = useState<SettlementResponse[]>([]);

  const ExpenseApi = useMemo(expenseApi, []);

  // Fetch settlements when household changes
  useEffect(() => {
    const fetchSettlements = async () => {
      if (!selectedHousehold?.key) {
        setSettlements([]);
        return;
      }
      try {
        const data = await ExpenseApi.fetchSettlements(selectedHousehold.key);
        if (data) {
          setSettlements(data);
        }
      } catch (error) {
        console.error('Failed to fetch settlements:', error);
      }
    };

    fetchSettlements();
  }, [selectedHousehold?.key, ExpenseApi]);

  // Check if an expense is settled
  // An expense is settled when all splits to the payer have been settled
  const isExpenseSettled = (expense: { expenseId: string; paidById: string; amount: number }) => {
    if (settlements.length === 0) return false;

    // Calculate total amount owed to the payer from settlements
    const totalSettledToPayer = settlements
      .filter((s) => s.toUserId === expense.paidById)
      .reduce((sum, s) => sum + s.amount, 0);

    // If the total settled amount >= expense amount, it's settled
    // Note: This is a simplification. In reality, we should track settlements per expense
    // But since settlements are for balances, we check if the payer has received
    // at least the expense amount in settlements
    return totalSettledToPayer >= expense.amount;
  };

  const ExpenseTable = () => {
    return (
      <ScrollArea
        type="scroll"
        scrollHideDelay={1000}
        className="h-[78vh] w-full rounded-md border px-5 py-1"
      >
        <Table className="my-4">
          <TableCaption>A list of your recent expenses.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-serif font-black">Date</TableHead>
              <TableHead className="font-serif font-black">Description</TableHead>
              <TableHead className="font-serif font-black">Paid By</TableHead>
              <TableHead className="font-serif font-black text-right">Amount</TableHead>
              <TableHead className="font-serif font-black">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {expenses &&
              expenses.map((expense) => (
                <TableRow key={expense.expenseId}>
                  <TableCell className="font-medium">
                    {dateFormatterUtc(expense.createdAt)}
                  </TableCell>
                  <TableCell>{expense.description}</TableCell>
                  <TableCell className="truncate">{expense.paidBy?.name}</TableCell>
                  <TableCell className="text-right">{formatCurrency(expense.amount)}</TableCell>
                  <TableCell>
                    {isExpenseSettled(expense) ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                        Settled
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                        Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Trash2Icon
                      className="w-4 hover:text-red-400"
                      onClick={() => handleDeleteExpense(expense.expenseId)}
                    />
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </ScrollArea>
    );
  };

  return (
    <div className="mx-3 mt-6">
      {isLoading ? (
        <ExpenseTableSkeleton />
      ) : expenses && expenses?.length > 0 ? (
        <ExpenseTable />
      ) : (
        <p className="m-5"> No expenses found</p>
      )}
    </div>
  );
}

export default ExpenseViewer;
