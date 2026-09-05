import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function dateFormatterUtc(date: string) {
  const dateObj = new Date(date);
  const formattedDate = dateObj.toLocaleDateString('en-IN');
  return formattedDate;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
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

/** Convert a string to snake_case format
 * @param str - The string to convert
 * @returns The string in snake_case format with trimmed whitespace
 */
export function toSnakeCase(str: string): string {
  return str.trim().toLowerCase().replace(/\s+/g, '_');
}

/** Extract 2-letter uppercase initials from full name */
export function getInitials(name?: string): string {
  if (!name || !name.trim()) return 'RM';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Format an ISO date string into human-readable relative time (e.g. "Just now", "5m ago", "2h ago", "Yesterday", "3d ago") */
export function formatTimeAgo(dateString?: string): string {
  if (!dateString) return 'Recently';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Just now';
    if (diffHrs < 1) return `${diffMins}m ago`;
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

