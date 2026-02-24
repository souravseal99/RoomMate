export type ChorePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ChoreFrequency = 'daily' | 'twice-weekly' | 'weekly' | 'bi-weekly' | 'monthly';
export type ChoreStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

export interface ChoreItem {
  choreId: string;
  description: string;
  frequency: ChoreFrequency;
  nextDue: string;
  completed: boolean;
  householdId: string;
  assignedToId: string | null;
  assignedToName?: string;
  priority: ChorePriority;
  notes?: string;
}
