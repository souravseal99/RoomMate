import { env } from "@/lib/utils";
export const SERVER_BASE_URL =
  env("SERVER_BASE_URL") || "http://127.0.0.1:5000";
