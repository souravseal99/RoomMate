export interface CreateExpenseRequestType {
  description: string;
  amount: number;
  paidById: string;
  sharedWith: string[];
}

export interface ExpenseResponse {
  expenseId: string;
  householdId: string;
  paidById: string;
  paidBy: PaidBy;
  amount: number;
  description: string;
  createdAt: string;
}

interface PaidBy {
  name: string;
  userId?: string;
}

export interface ExpenseContextType {
  expenses: ExpenseResponse[];
  setExpenses: (expenses: ExpenseResponse[] | undefined) => void;
}

export interface Expense {
  description: string;
  amount: number;
  paidById: string;
  sharedWith: string[];
  householdId: string;
}
