import { Expense } from "@generated/prisma";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { ExpenseSplitService } from "@src/expense-split/expenseSplit.service";
import { ExpenseRepo } from "@src/expenses/expense.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

export class ExpenseService {
  static async create(expense: ExpenseDto, sharedWith: string[]) {
    const isHouseholdMember = await HouseholdMemberRepo.isExistingUser(
      expense.paidById,
      expense.householdId
    );

    if (!isHouseholdMember)
      return ApiResponse.error("User is not a member of the household");

    try {
      if (!sharedWith.length) {
        const createdExpense: Expense = await ExpenseRepo.create(expense);

        return ApiResponse.success(
          createdExpense,
          "Expense added",
          StatusCodes.CREATED
        );
      } else {
        const createdExpense: Expense = await ExpenseRepo.create(expense);

        const shareAmount = createdExpense.amount / sharedWith.length;

        const splits: ExpenseSplitDto[] = sharedWith.map((userId) => ({
          expenseId: createdExpense.expenseId,
          userId: userId,
          shareAmount: shareAmount,
        }));

        const createdSplits = await ExpenseSplitService.bulkCreate(splits);

        return ApiResponse.success(
          { createdExpense: createdExpense, createdSplits: createdSplits },
          "Added Expense with Expense split",
          StatusCodes.CREATED
        );
      }
    } catch (error) {
      return ApiResponse.error("Unable to add Expense", StatusCodes.CONFLICT);
    }
  }
}
