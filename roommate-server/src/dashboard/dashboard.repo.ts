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
                    gt: new Date()
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

    static async getRecentActivities(userId: string) {
        // Fetch recent expenses where user is involved
        const recentExpenses = await prisma.expense.findMany({
            where: {
                OR: [
                    { paidById: userId },
                    { splits: { some: { userId: userId } } }
                ]
            },
            include: {
                paidBy: { select: { name: true } },
                household: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        // Fetch recent chores in user's households
        const recentChores = await prisma.chore.findMany({
            where: {
                household: {
                    members: { some: { userId: userId } }
                }
            },
            include: {
                assignedTo: { select: { name: true } },
                household: { select: { name: true } }
            },
            orderBy: { nextDue: 'asc' },
            take: 5
        });

        return {
            recentExpenses: recentExpenses.map(e => ({
                id: e.expenseId,
                type: 'EXPENSE',
                title: e.description,
                amount: e.amount,
                paidBy: e.paidBy.name,
                household: e.household.name,
                date: e.createdAt
            })),
            recentChores: recentChores.map(c => ({
                id: c.choreId,
                type: 'CHORE',
                title: c.description,
                status: c.completed ? 'COMPLETED' : 'PENDING',
                assignee: c.assignedTo?.name || 'Unassigned',
                household: c.household.name,
                dueDate: c.nextDue
            }))
        };
    }
}