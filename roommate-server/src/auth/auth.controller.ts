import { Request, Response } from "express";
import authService from "./auth.service";
import { StatusCodes } from "http-status-codes";
import refreshTokenSetter from "./refreshTokenSetter";

class AuthController {
  constructor() {}

  async register(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const { status, data, message } = await authService.registerUser(
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

  async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const { status, data, message } = await authService.login(email, password);

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

  async refresh(request: Request, response: Response) {
    const refreshToken = request.cookies.refreshToken;

    const { status, data, message } = await authService.refresh(refreshToken);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}

export default new AuthController();
