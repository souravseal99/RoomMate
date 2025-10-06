import type { ExpenseContextType } from "@/types/expenseTypes";
import { createContext, useMemo, useState, type ReactNode } from "react";

export const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

export const ExpenseProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const [expenses, setExpenses] = useState([]);

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
