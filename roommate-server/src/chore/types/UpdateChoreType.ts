export default interface UpdateChoreType {
  choreId?: string;
  assignedToId?: string;
  completed?: boolean;
  nextDue?: Date;
  priority?: string;
  notes?: string;
  description?: string;
  frequency?: string;
}
