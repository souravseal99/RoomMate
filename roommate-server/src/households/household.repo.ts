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
      include: {
        members: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async getHouseholdById(householdId: string) {
    return await prisma.household.findFirst({
      where: { householdId },
    });
  }

  static async delete(householdId: string) {
    return await prisma.$transaction([
      prisma.householdMember.deleteMany({ where: { householdId } }),
      prisma.expenseSplit.deleteMany({ where: { expense: { householdId } } }),
      prisma.expense.deleteMany({ where: { householdId } }),
      prisma.chore.deleteMany({ where: { householdId } }),
      prisma.inventoryItem.deleteMany({ where: { householdId } }),
      prisma.household.delete({ where: { householdId } }),
    ]);
  }
}
