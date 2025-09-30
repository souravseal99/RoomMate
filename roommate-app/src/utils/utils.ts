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
