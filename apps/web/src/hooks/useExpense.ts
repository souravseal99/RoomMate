import { ExpenseContext } from "@/contexts/ExpenseContext";
import { useContext } from "react";

const useExpense = () => {
  const context = useContext(ExpenseContext);

  if (!context)
    throw new Error("Expense context must be present inside ExpenseProvider");

  return context;
};

export default useExpense;
