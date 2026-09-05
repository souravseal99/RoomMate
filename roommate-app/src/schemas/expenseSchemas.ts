import { z } from 'zod';

export const EXPENSE_CATEGORIES = [
  { id: 'groceries', label: 'Groceries', emoji: '🛒', icon: 'shopping-cart' },
  { id: 'utilities', label: 'Electricity / Wi-Fi', emoji: '⚡', icon: 'zap' },
  { id: 'rent', label: 'Rent', emoji: '🏠', icon: 'home' },
  { id: 'takeout', label: 'Takeout / Food', emoji: '🍕', icon: 'utensils' },
  { id: 'supplies', label: 'Household Supplies', emoji: '🧻', icon: 'package' },
  { id: 'cleaning', label: 'Cleaning', emoji: '🧼', icon: 'sparkles' },
] as const;

export type ExpenseCategoryId = (typeof EXPENSE_CATEGORIES)[number]['id'];

export const createExpenseSchema = z.object({
  description: z
    .string()
    .trim()
    .min(2, 'Description must be at least 2 characters')
    .max(100, 'Description cannot exceed 100 characters'),
  amount: z
    .number({ message: 'Please enter a valid amount' })
    .positive('Amount must be greater than $0')
    .max(1000000, 'Amount exceeds maximum permitted limit'),
  paidById: z.string().min(1, 'Please select who paid for this expense'),
  sharedWith: z
    .array(z.string())
    .min(1, 'Please select at least 1 roommate to split with'),
  category: z.string().optional(),
});

export type CreateExpenseFormInput = z.infer<typeof createExpenseSchema>;

export const settlementSchema = z.object({
  fromUserId: z.string().min(1, 'Payer ID is required'),
  toUserId: z.string().min(1, 'Payee ID is required'),
  householdId: z.string().min(1, 'Household ID is required'),
  amount: z
    .number({ message: 'Please enter a valid settlement amount' })
    .positive('Settlement amount must be greater than $0'),
});

export type SettlementFormInput = z.infer<typeof settlementSchema>;
