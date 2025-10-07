import { createContext, useMemo, useState, type ReactNode } from "react";
import {
  type Expense,
  type ExpenseContextType,
  type ExpenseResponse,
} from "@/types/expenseTypes";

export const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

export const ExpenseProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [expenses, setExpenses] = useState<ExpenseResponse[] | undefined>([]);

  const providerValues = useMemo(
    () =>
      ({
        expenses,
        setExpenses,
      } as ExpenseContextType),
    [expenses, setExpenses]
  );

  return (
    <ExpenseContext.Provider value={providerValues}>
      {children}
    </ExpenseContext.Provider>
  );
};
