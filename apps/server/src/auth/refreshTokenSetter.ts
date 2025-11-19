import { Response } from "express";
import { USE_SECURE_COOKIE } from "@common/config";

const refreshTokenSetter = (response: Response, refreshToken: string) => {
  response.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: USE_SECURE_COOKIE as boolean,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000, //NOTE - 7 days
    path: "/",
  });
};

export default refreshTokenSetter;
