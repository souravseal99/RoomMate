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

  login(_request: any, response: any) {
    return response.json({
      status: 200,
      message: "hello from auth 2/login",
    });
  }
}

export default new AuthController();
