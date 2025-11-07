export type ChoreItem = {
  choreId: string;
  description: string;
  frequency: string;
  nextDue: string; // ISO date string
  completed: boolean;
  householdId: string;
  assignedToId: string;
};
