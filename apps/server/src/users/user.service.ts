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
      `Hello ${userRecord.name}`
    );
  }

  static async getUsers() {
    const userRecords: User[] | null = await UserRepo.getAllUsers();

    if (!userRecords)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const sanitisedUsers = userRecords.map((user) => sanitizeUser(user));

    return ApiResponse.success(sanitisedUsers);
  }
}
