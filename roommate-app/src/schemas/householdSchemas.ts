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

export const createHouseholdSchema = z.object({
  name: householdNameSchema,
});

export const joinHouseholdSchema = z.object({
  inviteCode: inviteCodeSchema,
});

export const updateHouseholdSchema = z.object({
  name: householdNameSchema,
});

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
