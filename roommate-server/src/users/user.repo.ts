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

  static async getUserByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email },
      });
    } catch (error) {
      return null;
    }
  }

  static async createUser(name: string, email: string, password: string) {
    return await prisma.user.create({
      data: {
        name,
        email,
        password,
      },
    });
  }

  static async updateUser(userId: string, data: { name?: string; password?: string }) {
    try {
      return await prisma.user.update({
        where: { userId },
        data,
      });
    } catch (error) {
      return null;
    }
  }
}

