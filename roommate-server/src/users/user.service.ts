import { ApiResponse } from "@common/utils/ApiResponse";
import prisma from "@common/utils/prisma";
import User from "@src/users/types/User";
import sanitizeUser from "@src/users/utils/sanitizeUser";

class UserService {
  constructor() {}

  async profile(userId: string) {
    const userRecord: User | null = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userRecord) return ApiResponse.error("User not found");

    return ApiResponse.success(
      sanitizeUser(userRecord),
      `Hello ${userRecord.name}`
    );
  }
}

export default new UserService();
