export default interface UpdateChoreType {
  choreId?: string;
  assignedToId?: string;
  completed?: boolean;
  completedAt?: Date | null;
  nextDue?: Date;
  priority?: string;
  notes?: string;
  description?: string;
  frequency?: string;
}
