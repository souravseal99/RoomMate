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

  static async getAllUsers() {
    try {
      return await prisma.user.findMany();
    } catch (error) {
      return null;
    }
  }

  static async getUserWithDetails(userId: string) {
    try {
      return await prisma.user.findUnique({
        where: { userId: userId },
        include: {
          households: {
            include: {
              household: {
                include: {
                  _count: {
                    select: { members: true },
                  },
                },
              },
            },
          },
        },
      });
    } catch (error) {
      return null;
    }
  }

  static async updateUser(
    userId: string,
    data: { name?: string; password?: string },
  ) {
    return await prisma.user.update({
      where: { userId },
      data,
    });
  }

  static async deleteUser(userId: string) {
    return await prisma.user.delete({
      where: { userId },
    });
  }
}
