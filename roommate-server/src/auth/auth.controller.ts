import { Request, Response } from "express";
import authService from "./auth.service";

class AuthController {
  constructor() {}

  async register(request: Request, response: Response) {
    const { name, email, password } = request.body;
    const { status, data, message } = await authService.registerUser(
      name,
      email,
      password
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  async login(request: Request, response: Response) {
    const { email, password } = request.body;
    const { status, data, message } = await authService.login(email, password);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}

export default new AuthController();
