import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { StatusCodes } from "http-status-codes";
import refreshTokenSetter from "./refreshTokenSetter";

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

    const { status, data, message } = await AuthService.refresh(refreshToken);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
