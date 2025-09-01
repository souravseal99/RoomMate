import prisma from "@common/utils/prisma";
import { Role } from "@generated/prisma";
import { nanoid } from "nanoid";

export class HouseholdRepository {
  static async create(name: string, userId: string, role?: Role) {
    return await prisma.household.create({
      data: {
        name,
        inviteCode: nanoid(8),

        members: {
          create: {
            userId: userId,
            role: role || Role.MEMBER,
          },
        },
      },
      include: { members: true },
    });
  }

  static async getHouseholdByInviteCode(inviteCode: string) {
    return await prisma.household.findUnique({ where: { inviteCode } });
  }

  static async getHouseholdsByUser(userId: string) {
    return await prisma.household.findMany({
      where: { members: { some: { userId } } },
    });
  }
}
