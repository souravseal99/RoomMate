import { env } from "@/utils/utils";
export const SERVER_BASE_URL =
  env("VITE_SERVER_BASE_URL") || "http://127.0.0.1:5000";
