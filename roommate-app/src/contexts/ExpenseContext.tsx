import { createContext, useMemo, useState, type ReactNode } from "react";
import { type ExpenseResponse } from "@/types/expenseTypes";

export type ExpenseContextType = {
  expenses: ExpenseResponse[] | undefined;
  setExpenses: React.Dispatch<React.SetStateAction<ExpenseResponse[] | undefined>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

export const ExpenseContext = createContext<ExpenseContextType | undefined>(
  undefined
);

export const ExpenseProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
  const [expenses, setExpenses] = useState<ExpenseResponse[] | undefined>([]);
  const [isLoading, setIsLoading] = useState(true);

  const providerValues = useMemo(
    () => ({ expenses, setExpenses, isLoading, setIsLoading }),
    [expenses, setExpenses, isLoading, setIsLoading]
  );

  return (
    <ExpenseContext.Provider value={providerValues as ExpenseContextType}>
      {children}
    </ExpenseContext.Provider>
  );
};
