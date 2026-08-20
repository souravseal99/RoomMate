import type { LoginPayload, RegisterPayload, AuthMode } from '@/schemas/authSchemas';

export type { RegisterPayload, LoginPayload, AuthMode };


export interface RegisterData {
  name: string;
  email: string;
  accessToken: string;
}

export interface LoginData {
  accessToken: string;
  email: string;
}

export interface AuthFormInputData {
  mode: AuthMode;
  onSubmit: (values: RegisterPayload | LoginPayload) => void;
}
