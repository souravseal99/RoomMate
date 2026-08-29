export interface CreateExpenseRequestType {
  description: string;
  amount: number;
  paidById: string;
  householdId: string;
  sharedWith: string[];
  category?: string;
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
  fromUser?: { name: string; userId?: string };
  toUserId: string;
  toUser?: { name: string; userId?: string };
  amount: number;
  createdAt: string;
}

export interface ExpenseSplit {
  expenseSplitId?: string;
  expenseId?: string;
  userId: string;
  shareAmount: number;
  settled?: boolean;
}

export interface PaidBy {
  name: string;
  userId?: string;
}

export interface ExpenseResponse {
  expenseId: string;
  householdId: string;
  paidById: string;
  paidBy?: PaidBy;
  amount: number;
  description: string;
  category?: string;
  createdAt: string;
  splits?: ExpenseSplit[];
}

export interface BalanceEntry {
  userId: string;
  name: string;
  balance: number;
}

export interface OptimizedSettlement {
  fromUserId: string;
  fromName: string;
  toUserId: string;
  toName: string;
  amount: number;
}

export interface BalancesData {
  balances: BalanceEntry[];
  settlements: OptimizedSettlement[];
}

export interface ExpenseContextType {
  expenses: ExpenseResponse[];
  setExpenses: (expenses: ExpenseResponse[] | undefined) => void;
}

export interface Expense {
  expenseId?: string;
  description: string;
  amount: number;
  paidById: string;
  sharedWith: string[];
  householdId: string;
  category?: string;
  createdAt?: string;
}
