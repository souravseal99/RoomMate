import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function env(key: string) {
  return import.meta.env[key];
}

export function dateFormatterUtc(date: string) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString("en-IN");
  return formattedDate;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Get the difference between two dates in days from ISO string format
 * @param date1 - The first date in ISO string format
 * @param date2 - The second date in ISO string format (optional, defaults to current date)
 * @returns The difference between the two dates in days
 */
export function getDateDifferenceInDays(date1: string, date2?: string): number {
  if (!date2) {
    date2 = new Date().toISOString();
  }
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}
