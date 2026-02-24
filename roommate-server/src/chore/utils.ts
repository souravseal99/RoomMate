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
