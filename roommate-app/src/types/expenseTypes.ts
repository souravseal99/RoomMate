export interface CreateExpenseRequestType {
  description: string;
  amount: number;
  paidById: string;
  sharedWith: string[];
}

export interface SettlementRequest {
  fromUserId: string;
  toUserId: string;
  householdId: string;
  amount: number;
}

export interface SettlementResponse {
  settlementId: string;
  fromUserId: string;
  fromUser: { name: string; userId?: string };
  toUserId: string;
  toUser: { name: string; userId?: string };
  amount: number;
  createdAt: string;
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
