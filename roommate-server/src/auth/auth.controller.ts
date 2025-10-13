import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import refreshTokenSetter from "./refreshTokenSetter";
import { USE_SECURE_COOKIE } from "@src/common/config";

export class AuthController {
  static async register(request: Request, response: Response) {
    const { name, email, password } = request.body;

    const { status, data, message } = await AuthService.registerUser(
      name,
      email,
      password
    );

    const { refreshToken, responseData } = data;

    if (status === StatusCodes.OK && refreshToken) {
      await refreshTokenSetter(response, refreshToken);
    }

    return response.status(status).json({
      message: message,
      data: responseData,
    });
  }

  static async login(request: Request, response: Response) {
    const { email, password } = request.body;

    const { status, data, message } = await AuthService.login(email, password);

    if (!data?.refreshToken || !data?.responseData)
      return response.status(status).json({ message: message });

    const { refreshToken, responseData } = data;

    if (status === StatusCodes.OK && refreshToken) {
      await refreshTokenSetter(response, refreshToken);
    }

    return response.status(status).json({
      message: message,
      data: responseData,
    });
  }

  static async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies.refreshToken;

    if (!refreshToken) {
      return response.status(StatusCodes.UNAUTHORIZED).json({
        message: "No refresh token provided",
      });
    }

    console.log("Received refresh token:", "..." + refreshToken.slice(-9, -1));

    const { status, data, message } = await AuthService.refresh(refreshToken);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  //TODO - Implement logout in AuthService
  static async logout(_request: Request, response: Response) {
    response.clearCookie("refreshToken", {
      httpOnly: true,
      secure: USE_SECURE_COOKIE as boolean,
      sameSite: "lax",
    });
  }
}
