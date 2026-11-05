import { env } from "@src/common/utils/env";
import { SignOptions } from "jsonwebtoken";

export const INTERNAL_SERVER_ERROR = "Internal Server Error";

export const BCRYPT_SALT_ROUNDS = parseInt(
  process.env.BCRYPT_SALT_ROUNDS || "10",
  10,
);

const isProduction = process.env.NODE_ENV === "production";

export const JWT_SECRET = isProduction
  ? env("JWT_SECRET")
  : process.env.JWT_SECRET || "dev_jwt_secret_key_change_in_production";

export const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN ||
  "15m") as SignOptions["expiresIn"];

export const JWT_REFRESH_SECRET = isProduction
  ? env("JWT_REFRESH_SECRET")
  : process.env.JWT_REFRESH_SECRET ||
    "dev_refresh_secret_key_change_in_production";

export const JWT_REFRESH_EXPIRES_IN = (process.env.JWT_REFRESH_EXPIRES_IN ||
  "7d") as SignOptions["expiresIn"];

export const CSRF_SECRET = isProduction
  ? process.env.CSRF_SECRET || env("JWT_SECRET")
  : process.env.CSRF_SECRET ||
    process.env.JWT_SECRET ||
    "roommate_csrf_super_secret_key_2026_at_least_32_characters";

export const USE_SECURE_COOKIE =
  process.env.USE_SECURE_COOKIE === "true" || isProduction;
