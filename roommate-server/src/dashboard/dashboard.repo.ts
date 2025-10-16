import prisma from "@src/common/utils/prisma";

export class DashboardRepo {

    static async getHouseholdCount(userId: string) {
        return await prisma.householdMember.count({
            where: { userId: userId }
        });
    }

    static async getPendingChoresCount(userId: string) {
        return await prisma.chore.count({
            where: {
                assignedToId: userId,
                completed: false,
                nextDue: {
                    lt: new Date()
                }
            },
        });
    }

    static async getExpenses(userId: string) {
        const res = await prisma.expense.aggregate({
            where: {
                paidById: userId
            },
            _sum: {
                amount: true,
            },
        })
        return res._sum.amount || 0;
    }
}