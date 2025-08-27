import { StatusCodes } from "http-status-codes";
import prisma from "@common/utils/prisma";
import User from "@src/users/types/User";
import { ApiResponse } from "@common/utils/ApiResponse";
import sanitizeUser from "@src/users/utils/sanitizeUser";

export class UserService {
  static async profile(userId: string) {
    const userRecord: User | null = await prisma.user.findUnique({
      where: { userId: userId },
    });

    if (!userRecord)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND, {
        userId: userId,
      });

    return ApiResponse.success(
      sanitizeUser(userRecord),
      `Hello ${userRecord.name}`
    );
  }
}
