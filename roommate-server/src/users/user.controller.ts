import { Request, Response } from "express";
import { UserService } from "@src/users/user.service";
import { getUserFromRequest } from "@common/utils/utils";

export class UserController {
  static async profile(request: Request, response: Response) {
    const { userId } = getUserFromRequest(request);

    const { status, data, message } = await UserService.profile(userId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
