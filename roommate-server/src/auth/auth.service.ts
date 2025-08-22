import { Request, Response } from "express";
class AuthService {
  constructor() {}

  public registerUser(request: Request, response: Response) {
    return response.json({ status: 200, reqBody: request.body });
  }
}

export default new AuthService();
