import { z } from 'zod';

export const householdNameSchema = z
  .string()
  .trim()
  .min(2, 'Household name must be at least 2 characters')
  .max(50, 'Household name cannot exceed 50 characters');

export const inviteCodeSchema = z
  .string()
  .trim()
  .min(6, 'Invite code must be at least 6 characters')
  .max(12, 'Invite code cannot exceed 12 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Invite code can only contain letters, numbers, and dashes');

export const householdSettingsSchema = z.object({
  unitOrApt: z
    .string()
    .trim()
    .max(30, 'Unit name cannot exceed 30 characters')
    .optional()
    .or(z.literal('')),
  billingCycleDay: z.coerce.number().min(1).max(31).default(1),
  targetRoommates: z.coerce.number().min(2).max(12).default(4),
  monthlyCommunalBudget: z.coerce.number().positive().optional().nullable().or(z.literal('')),
  wifiSsid: z.string().trim().max(50).optional().or(z.literal('')),
  wifiPassword: z.string().trim().max(50).optional().or(z.literal('')),
  trashDay: z
    .enum(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .default('Wednesday'),
  currency: z.string().default('INR'),
});

export const createHouseholdSchema = z.object({
  name: householdNameSchema,
  settings: householdSettingsSchema.optional(),
});

export const joinHouseholdSchema = z.object({
  inviteCode: inviteCodeSchema,
});

export const updateHouseholdSchema = z.object({
  name: householdNameSchema,
  settings: householdSettingsSchema.optional(),
});

export type HouseholdSettingsInput = z.infer<typeof householdSettingsSchema>;
export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;
export type JoinHouseholdInput = z.infer<typeof joinHouseholdSchema>;
export type UpdateHouseholdInput = z.infer<typeof updateHouseholdSchema>;

export const SUGGESTED_HOUSEHOLD_NAMES = [
  'The Penthouse',
  'Baker St Crew',
  'Casa Nostra',
  'Cozy Crib',
  'Sunny Loft',
  'Flat 204',
] as const;
