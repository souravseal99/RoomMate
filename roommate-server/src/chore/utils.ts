import {
  FREQUENCY_DAILY,
  FREQUENCY_TWICE_WEEKLY,
  FREQUENCY_WEEKLY,
  FREQUENCY_BI_WEEKLY,
  FREQUENCY_MONTHLY,
} from "@src/chore/config";

export function getNextDueDate(currentDueDate: Date, frequency: string) {
  const nextDueDate: Date = new Date(currentDueDate);

  switch (frequency) {
    case FREQUENCY_DAILY:
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case FREQUENCY_TWICE_WEEKLY:
      nextDueDate.setDate(nextDueDate.getDate() + 3);
      break;
    case FREQUENCY_WEEKLY:
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;
    case FREQUENCY_BI_WEEKLY:
      nextDueDate.setDate(nextDueDate.getDate() + 14);
      break;
    case FREQUENCY_MONTHLY:
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    default:
      break;
  }
  return nextDueDate;
}

export function calculateChoreKarma(
  priority?: string | null,
  frequency?: string | null,
): number {
  const basePoints: Record<string, number> = {
    HIGH: 25,
    MEDIUM: 15,
    LOW: 10,
  };

  const frequencyMultiplier: Record<string, number> = {
    daily: 1.0,
    "twice-weekly": 1.1,
    weekly: 1.2,
    "bi-weekly": 1.3,
    monthly: 1.5,
  };

  const base = basePoints[(priority || "MEDIUM").toUpperCase()] || 15;
  const mult =
    frequencyMultiplier[(frequency || "weekly").toLowerCase()] || 1.0;
  return Math.round(base * mult);
}

export interface WeekDayMetric {
  day: string;
  date: string;
  isToday: boolean;
  status:
    "completed" | "today-done" | "pending" | "missed" | "rest" | "upcoming";
  completedCount: number;
  totalCount: number;
}

export function getStartAndEndOfWeek(refDate: Date = new Date()) {
  const date = new Date(refDate);
  const day = (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  return { monday, sunday };
}
