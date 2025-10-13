import prisma from "@src/common/utils/prisma";

export class DashboardRepo {
  static async getUserData(userId: string) {
    const user = await prisma.user.findUnique({
      where: { userId },
      select: {
        name: true,
        email: true
      }
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }

  static async getUserHouseholds(userId: string) {
    const households = await prisma.householdMember.findMany({
      where: { userId },
      include: {
        household: {
          include: {
            members: true,
            expenses: true
          }
        }
      }
    });

    return households.map((member: any) => {
      const totalExpenses = member.household.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
      
      return {
        id: member.household.householdId,
        name: member.household.name,
        memberCount: member.household.members.length,
        totalExpenses,
        myBalance: 0 // This would need to be calculated based on expense splits
      };
    });
  }

  static async getRecentExpenses(userId: string, limit: number) {
    const expenses = await prisma.expense.findMany({
      where: {
        OR: [
          { paidById: userId },
          {
            splits: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      include: {
        paidBy: true,
        household: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });

    return expenses.map((expense: any) => ({
      id: expense.expenseId,
      description: expense.description,
      amount: expense.amount,
      paidBy: expense.paidBy.name,
      householdName: expense.household.name,
      createdAt: expense.createdAt.toISOString()
    }));
  }

  static async getUpcomingChores(userId: string, limit: number) {
    const chores = await prisma.chore.findMany({
      where: {
        OR: [
          { assignedToId: userId },
          {
            household: {
              members: {
                some: { userId }
              }
            }
          }
        ],
        completed: false
      },
      include: {
        assignedTo: true,
        household: true
      },
      orderBy: {
        nextDue: 'asc'
      },
      take: limit
    });

    return chores.map((chore: any) => ({
      id: chore.choreId,
      title: chore.description, // Using description as title since there's no title field
      description: chore.description || '',
      dueDate: chore.nextDue.toISOString(),
      householdName: chore.household.name,
      assignedTo: chore.assignedTo?.name || 'Unassigned'
    }));
  }

  static async getUserStats(userId: string) {
    // Get households count
    const householdsCount = await prisma.householdMember.count({
      where: { userId }
    });

    // Get total expenses involving user
    const totalExpenses = await prisma.expense.aggregate({
      where: {
        OR: [
          { paidById: userId },
          {
            splits: {
              some: {
                userId: userId
              }
            }
          }
        ]
      },
      _sum: {
        amount: true
      }
    });

    // Get chores stats
    const choreStats = await prisma.chore.groupBy({
      by: ['completed'],
      where: {
        OR: [
          { assignedToId: userId },
          {
            household: {
              members: {
                some: { userId }
              }
            }
          }
        ]
      },
      _count: {
        completed: true
      }
    });

    const completedChores = choreStats.find((stat: any) => stat.completed === true)?._count.completed || 0;
    const pendingChores = choreStats.find((stat: any) => stat.completed === false)?._count.completed || 0;

    return {
      totalHouseholds: householdsCount,
      totalExpenses: totalExpenses._sum?.amount || 0,
      totalOwed: 0, // Would need complex calculation
      totalOwing: 0, // Would need complex calculation
      completedChores,
      pendingChores
    };
  }

  static async getHouseholdStats(userId: string, householdId: string) {
    // Verify user is member of household
    const membership = await prisma.householdMember.findFirst({
      where: {
        userId,
        householdId
      }
    });

    if (!membership) {
      throw new Error("User is not a member of this household");
    }

    const household = await prisma.household.findUnique({
      where: { householdId },
      include: {
        members: {
          include: {
            user: true
          }
        },
        expenses: {
          include: {
            paidBy: true,
            splits: {
              include: {
                user: true
              }
            }
          }
        },
        chores: {
          include: {
            assignedTo: true
          }
        }
      }
    });

    if (!household) {
      throw new Error("Household not found");
    }

    const totalExpenses = household.expenses.reduce((sum: number, expense: any) => sum + expense.amount, 0);
    const memberCount = household.members.length;
    const completedChores = household.chores.filter((chore: any) => chore.completed === true).length;
    const pendingChores = household.chores.filter((chore: any) => chore.completed === false).length;

    return {
      householdName: household.name,
      memberCount,
      totalExpenses,
      completedChores,
      pendingChores,
      members: household.members.map((member: any) => ({
        id: member.userId,
        name: member.user.name,
        role: member.role
      }))
    };
  }
}