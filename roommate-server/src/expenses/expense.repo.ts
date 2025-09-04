import { Expense } from "@generated/prisma";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import prisma from "@src/common/utils/prisma";

export class ExpenseRepo {
  static async create(expense: ExpenseDto) {
    return await prisma.expense.create({
      data: expense as Expense,
    });
  }

  static async getExpensesByHouseholdId(householdId: string) {
    return await prisma.expense.findMany({
      where: { householdId: householdId },
    });
  }

  static async getExpensesWithSplits(householdId: string) {
    return await prisma.expense.findMany({
      where: { householdId },
      include: {
        paidBy: {
          select: {
            userId: true,
            name: true,
          },
        },
        splits: {
          include: {
            user: {
              select: {
                userId: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
