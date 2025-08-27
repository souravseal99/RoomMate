import { Request, Response } from "express";
import userService from "./user.service";

class UserController {
  constructor() {}

  async profile(request: Request, response: Response) {
    const userId: string = request?.user?.userId || "";

    const { status, data, message } = await userService.profile(userId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}

export default new UserController();
