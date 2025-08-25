import { env } from "@src/common/utils/env";

export const INTERNAL_SERVER_ERROR = "Internal Server Error";
export const BCRYPT_SALT_ROUNDS = parseInt(env("BCRYPT_SALT_ROUNDS")) || 10;
