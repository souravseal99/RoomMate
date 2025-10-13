import { Role } from "@generated/prisma";
import prisma from "@src/common/utils/prisma";

export class HouseholdMemberRepo {
  static async create(householdMemberBody: any) {
    return await prisma.householdMember.create({
      data: householdMemberBody,
    });
  }

  static async isExistingUser(userId: string, householdId: string) {
    return await prisma.householdMember.findUnique({
      where: {
        userId_householdId: {
          userId: userId,
          householdId: householdId,
        },
      },
    });
  }

  static async join(userId: string, householdId: string) {
    return await prisma.householdMember.create({
      data: {
        userId: userId,
        householdId: householdId,
        role: Role.MEMBER,
      },
    });
  }

  static async getByHouseholdId(householdId: string) {
    return await prisma.householdMember.findMany({
      where: { householdId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
