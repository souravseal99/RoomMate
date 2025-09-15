import Axios from "@/lib/axios";
import type { LoginPayload, RegisterPayload } from "@/features/auth/types";

export const registerUser = async (payload: RegisterPayload) =>
  await Axios.post("/auth/register", payload);

export const loginUser = async (payload: LoginPayload) =>
  await Axios.post("/auth/login", payload);
