import api from "@/api/axios";
import type { LoginPayload, RegisterPayload } from "@/types/authTypes";

export const registerUser = async (payload: RegisterPayload) =>
  await api.post("/auth/register", payload);

export const loginUser = async (payload: LoginPayload) =>
  await api.post("/auth/login", payload);
