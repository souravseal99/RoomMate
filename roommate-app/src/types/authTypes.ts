export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

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
  mode: "login" | "register";
  onSubmit: (values: RegisterPayload | LoginPayload) => void;
}
