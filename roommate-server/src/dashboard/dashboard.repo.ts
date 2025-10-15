import prisma from "@common/utils/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export class DashboardRepo {
  static async getHouseholdCount(userId: string): Promise<number> {
    const count = await prisma.householdMember.count({
      where: {
        userId: userId,
      },
    });

    return count;
  }

  static async getPendingChoresCount(userId: string): Promise<number> {
    const count = await prisma.chore.count({
      where: {
        assignedToId: userId,
        completed: false,
      },
    });

    return count;
  }

  static async getCurrentMonthExpenses(userId: string): Promise<number> {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const userHouseholds = await prisma.householdMember.findMany({
      where: {
        userId: userId,
      },
      select: {
        householdId: true,
      },
    });

    const householdIds = userHouseholds.map((hm) => hm.householdId);

    const result = await prisma.expense.aggregate({
      where: {
        householdId: {
          in: householdIds,
        },
        createdAt: {
          gte: monthStart,
          lte: monthEnd,
        },
      },
      _sum: {
        amount: true,
      },
    });

    return result._sum.amount || 0;
  }
}
