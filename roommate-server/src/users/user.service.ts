import { StatusCodes } from "http-status-codes";
import { User } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import sanitizeUser from "@common/utils/sanitizeUser";
import { UserRepo } from "@src/users/user.repo";
import UserDto from "@src/common/dtos/UserDto";

export class UserService {
  static async profile(userId: string) {
    const userRecord: User | null = await UserRepo.getUserById(userId);

    if (!userRecord)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND, {
        userId: userId,
      });

    return ApiResponse.success(
      sanitizeUser(userRecord),
      `Hello ${userRecord.name}`,
    );
  }

  static async updateProfile(userId: string, data: { name?: string }) {
    const updated = await UserRepo.updateUser(userId, data);

    if (!updated) {
      return ApiResponse.error("Failed to update profile", StatusCodes.INTERNAL_SERVER_ERROR);
    }

    return ApiResponse.success(
      sanitizeUser(updated),
      "Profile updated successfully",
      StatusCodes.OK
    );
  }
}

