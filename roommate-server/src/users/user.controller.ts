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
      message,
      data,
    });
  }

  static async deleteAccount(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);

    const { status, data, message } = await UserService.deleteAccount(userId);

    return response.status(status).json({
      message,
      data,
    });
  }

  static async getPreferences(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { status, data, message } = await UserService.getPreferences(userId);
    return response.status(status).json({ message, data });
  }

  static async updatePreferences(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { status, data, message } = await UserService.updatePreferences(
      userId,
      request.body,
    );
    return response.status(status).json({ message, data });
  }
}
