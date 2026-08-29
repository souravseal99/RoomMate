import { Request, Response } from "express";
import { UserService } from "@src/users/user.service";
import { getUserFromRequestBody } from "@common/utils/utils";

export class UserController {
  static async profile(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);

    const { status, data, message } = await UserService.profile(userId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async updateProfile(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { name } = request.body;

    const { status, data, message } = await UserService.updateProfile(userId, {
      name,
    });

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}

