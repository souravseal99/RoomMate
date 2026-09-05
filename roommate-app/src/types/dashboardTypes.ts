export interface RecentExpenseActivity {
  id: string;
  type: 'EXPENSE';
  title: string;
  amount: number;
  paidBy: string;
  household: string;
  date: string;
}

export interface RecentChoreActivity {
  id: string;
  type: 'CHORE';
  title: string;
  status: 'COMPLETED' | 'PENDING' | 'OVERDUE';
  assignee: string;
  household: string;
  dueDate: string;
}

export interface DashboardStats {
  householdCount: number;
  pendingChoresCount: number;
  expenses: number;
  recentExpenses: RecentExpenseActivity[];
  recentChores: RecentChoreActivity[];
}

export type ActivityFeedFilter = 'ALL' | 'EXPENSES' | 'CHORES';
