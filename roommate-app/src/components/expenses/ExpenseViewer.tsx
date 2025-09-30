import { useEffect, useMemo } from "react";
import { Trash2Icon } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { dateFormatterUtc, formatCurrency } from "@/utils/utils";

type Expense = {
  expenseId: string;
  householdId: string;
  description: string;
  amount: number;
  paidById: string;
  paidBy: { name: string };
  createdAt: string;
};

type ExpenseViewerProps = {
  expenses: Expense[];
  handleDeleteExpense: (expenseId: string) => Promise<void>;
};

function ExpenseViewer({ expenses, handleDeleteExpense }: ExpenseViewerProps) {
  useEffect(() => {
    console.log("expense viewer use effect: ", expenses?.length);
    console.log("expense viewer use effect: ", expenses);
  }, [expenses]);

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
              <TableHead className="font-serif font-black">
                Description
              </TableHead>
              <TableHead className="font-serif font-black">Paid By</TableHead>
              <TableHead className="font-serif font-black text-right">
                Amount
              </TableHead>
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
                  <TableCell className="truncate">
                    {expense.paidBy?.name}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(expense.amount)}
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
  console.log("expense viewer : ", expenses?.length);

  return (
    <div className="mx-3 mt-6">
      {expenses?.length > 0 ? (
        <ExpenseTable />
      ) : (
        <p className="m-5"> No expenses found</p>
      )}
    </div>
  );
}

export default ExpenseViewer;
