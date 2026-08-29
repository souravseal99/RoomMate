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
            userId: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getSuggestedCoMembers(userId: string) {
    // 1. Find all households the user is currently a member of
    const userHouseholdMemberships = await prisma.householdMember.findMany({
      where: { userId },
      select: { householdId: true },
    });

    const householdIds = userHouseholdMemberships.map((m) => m.householdId);

    if (householdIds.length === 0) {
      return [];
    }

    // 2. Find all other members in those households
    const coMembers = await prisma.householdMember.findMany({
      where: {
        householdId: { in: householdIds },
        userId: { not: userId },
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
        household: {
          select: {
            householdId: true,
            name: true,
          },
        },
      },
    });

    // 3. De-duplicate by userId and collect shared household names
    const memberMap = new Map<
      string,
      {
        userId: string;
        name: string;
        email: string;
        sharedHouseholds: string[];
      }
    >();

    for (const record of coMembers) {
      if (!record.user) continue;
      const existing = memberMap.get(record.userId);
      if (existing) {
        if (!existing.sharedHouseholds.includes(record.household.name)) {
          existing.sharedHouseholds.push(record.household.name);
        }
      } else {
        memberMap.set(record.userId, {
          userId: record.user.userId,
          name: record.user.name,
          email: record.user.email,
          sharedHouseholds: [record.household.name],
        });
      }
    }

    const result = Array.from(memberMap.values());
    // Randomize suggestions
    return result.sort(() => 0.5 - Math.random());
  }

  static async leave(userId: string, householdId: string) {
    try {
      return await prisma.householdMember.delete({
        where: {
          userId_householdId: {
            userId,
            householdId,
          },
        },
      });
    } catch (error: any) {
      // P2025: Record to delete does not exist
      if (error.code === "P2025") {
        return null;
      }
      throw error;
    }
  }
}
