import {
  FREQUENCY_DAILY,
  FREQUENCY_MONTHLY,
  FREQUENCY_WEEKLY,
} from "@src/chore/config";

export function getNextDueDate(currentDueDate: Date, frequency: string) {
  const nextDueDate: Date = new Date(currentDueDate);

  switch (frequency) {
    case FREQUENCY_DAILY:
      nextDueDate.setDate(nextDueDate.getDate() + 1);
      break;
    case FREQUENCY_MONTHLY:
      nextDueDate.setMonth(nextDueDate.getMonth() + 1);
      break;
    case FREQUENCY_WEEKLY:
      nextDueDate.setDate(nextDueDate.getDate() + 7);
      break;

    default:
      break;
  }
  return nextDueDate;
}
