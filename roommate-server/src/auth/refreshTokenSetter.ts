import { Response } from "express";
import { USE_SECURE_COOKIE } from "@common/config";

const refreshTokenSetter = async (response: Response, refreshToken: string) => {
  await response.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: USE_SECURE_COOKIE as boolean,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, //NOTE - 7 days
  });
};

export default refreshTokenSetter;
