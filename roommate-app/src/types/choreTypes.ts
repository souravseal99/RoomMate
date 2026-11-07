export type ChorePriority = 'HIGH' | 'MEDIUM' | 'LOW';
export type ChoreFrequency = 'daily' | 'twice-weekly' | 'weekly' | 'bi-weekly' | 'monthly';
export type ChoreStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';

export interface ChoreItem {
  choreId: string;
  description: string;
  frequency: ChoreFrequency;
  nextDue: string;
  completed: boolean;
  completedAt?: string | null;
  householdId: string;
  assignedToId: string | null;
  assignedToName?: string;
  priority: ChorePriority;
  notes?: string;
  karma?: number;
}

export type WeekDayDutyStatus =
  'completed' | 'today-done' | 'pending' | 'missed' | 'rest' | 'upcoming';

export interface WeekDayDutyMetric {
  day: string;
  date: string;
  isToday: boolean;
  status: WeekDayDutyStatus;
  completedCount: number;
  totalCount: number;
}

export interface DutyPunchcardData {
  streak: {
    streakDays: number;
    streakLabel: string;
  };
  rhythm: {
    totalCount: number;
    completedCount: number;
    rhythmPercent: number;
    weekDays: WeekDayDutyMetric[];
  };
  activeChore: ChoreItem | null;
  nextChore: ChoreItem | null;
  recentCompletedChore: ChoreItem | null;
  nextRotationNote: {
    assigneeName: string;
    description: string;
    nextDue: string;
  } | null;
}
