import prisma from "@src/common/utils/prisma";

export interface SettlementDto {
  fromUserId: string;
  toUserId: string;
  householdId: string;
  amount: number;
}

export class SettlementRepo {
  static async create(settlement: SettlementDto) {
    return await prisma.settlement.create({
      data: settlement,
      include: {
        fromUser: {
          select: { name: true, userId: true },
        },
        toUser: {
          select: { name: true, userId: true },
        },
      },
    });
  }

  static async getByHouseholdId(householdId: string) {
    return await prisma.settlement.findMany({
      where: { householdId },
      include: {
        fromUser: {
          select: { name: true, userId: true },
        },
        toUser: {
          select: { name: true, userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getSettlementsForUser(userId: string, householdId: string) {
    return await prisma.settlement.findMany({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        householdId,
      },
      include: {
        fromUser: {
          select: { name: true, userId: true },
        },
        toUser: {
          select: { name: true, userId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  static async getTotalSettled(
    fromUserId: string,
    toUserId: string,
    householdId: string,
  ) {
    const settlements = await prisma.settlement.findMany({
      where: {
        fromUserId,
        toUserId,
        householdId,
      },
    });
    return settlements.reduce((sum, s) => sum + s.amount, 0);
  }
}
