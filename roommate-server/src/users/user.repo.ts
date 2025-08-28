import prisma from "@src/common/utils/prisma";

export class UserRepo {
  static async getUserById(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { userId: userId },
      });
    } catch (error) {
      return null;
    }
  }
}
