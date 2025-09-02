import { Expense } from "@generated/prisma";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import prisma from "@src/common/utils/prisma";

export class ExpenseRepo {
  static async create(expense: ExpenseDto) {
    return await prisma.expense.create({
      data: expense as Expense,
    });
  }
}
