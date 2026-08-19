import { Trash2Icon, Receipt } from 'lucide-react';
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

  const isExpenseSettled = (expense: { expenseId: string; paidById: string; amount: number }) => {
    if (settlements.length === 0) return false;

    const totalSettledToPayer = settlements
      .filter((s) => s.toUserId === expense.paidById)
      .reduce((sum, s) => sum + s.amount, 0);

    return totalSettledToPayer >= expense.amount;
  };

  const ExpenseTable = () => {
    return (
      <div className="w-full bg-card border border-border rounded-lg shadow-xs overflow-hidden">
        <div className="p-4 border-b border-border/40 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary-container" />
          <h3 className="text-sm font-semibold text-foreground">Recent Expenses Record</h3>
        </div>
        <ScrollArea className="max-h-[60vh] w-full">
          <Table>
            <TableCaption className="py-2 text-xs text-muted-foreground">
              A list of recent household expense entries.
            </TableCaption>
            <TableHeader className="bg-background/80 border-b border-border">
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Date</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Description</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Paid By</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider text-right">Amount</TableHead>
                <TableHead className="font-bold text-foreground text-xs uppercase tracking-wider">Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses &&
                expenses.map((expense) => (
                  <TableRow key={expense.expenseId} className="border-border hover:bg-background/50 transition-colors">
                    <TableCell className="font-medium text-xs text-muted-foreground whitespace-nowrap">
                      {dateFormatterUtc(expense.createdAt)}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">{expense.description}</TableCell>
                    <TableCell className="text-foreground text-sm">{expense.paidBy?.name}</TableCell>
                    <TableCell className="text-right font-bold text-foreground">
                      {formatCurrency(expense.amount)}
                    </TableCell>
                    <TableCell>
                      {isExpenseSettled(expense) ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-300">
                          Settled
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-300">
                          Pending
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(expense.expenseId)}
                        className="text-muted-foreground hover:text-destructive transition-colors p-1 cursor-pointer rounded-sm hover:bg-destructive/10"
                        title="Delete Expense"
                      >
                        <Trash2Icon className="w-4 h-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    );
  };

  return (
    <div className="w-full mt-4">
      {isLoading ? (
        <ExpenseTableSkeleton />
      ) : expenses && expenses?.length > 0 ? (
        <ExpenseTable />
      ) : (
        <div className="p-8 text-center bg-card border border-border rounded-lg text-muted-foreground italic text-sm">
          No expenses recorded for this household yet.
        </div>
      )}
    </div>
  );
}

export default ExpenseViewer;
