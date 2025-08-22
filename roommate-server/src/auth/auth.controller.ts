import { Request, Response } from "express";
import authService from "./auth.service";

class AuthController {
  constructor() {}

  testAuthRoute(_request: any, response: any) {
    return response.json({
      status: 200,
      message: "hello from auth",
    });
  }

  testAuthRoute2(_request: any, response: any) {
    return response.json({
      status: 200,
      message: "hello from auth 2",
    });
  }

  register(request: Request, response: Response) {
    return authService.registerUser(request, response);
  }

  login(_request: any, response: any) {
    return response.json({
      status: 200,
      message: "hello from auth 2/login",
    });
  }
}

export default new AuthController();
