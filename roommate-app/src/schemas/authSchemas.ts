import { z } from 'zod';

export const emailSchema = z
  .email('Invalid email');

export const passwordSchema = z
  .string()
  .min(8, 'Min 8 characters');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Name required');

export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerSchema = loginSchema.extend({
  name: nameSchema,
});

export type LoginPayload = z.infer<typeof loginSchema>;
export type RegisterPayload = z.infer<typeof registerSchema>;

export const AUTH_MODE_REGISTER = 'register' as const;
export const AUTH_MODE_LOGIN = 'login' as const;
export type AuthMode = typeof AUTH_MODE_REGISTER | typeof AUTH_MODE_LOGIN;

