import { StatusCodes } from "http-status-codes";
import { Expense } from "@generated/prisma";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { ExpenseSplitService } from "@src/expense-split/expenseSplit.service";
import { ExpenseRepo } from "@src/expenses/expense.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import calculateBalance, { calculateSettlements, BalanceEntry } from "@src/expenses/calculateBalance";

export class ExpenseService {
  static async create(expense: ExpenseDto, sharedWith: string[]) {
    const isHouseholdMember = await HouseholdMemberRepo.isExistingUser(
      expense.paidById,
      expense.householdId
    );

    if (!isHouseholdMember)
      return ApiResponse.error("User is not a member of the household");

    try {
      if (!sharedWith || !sharedWith?.length) {
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
      console.error(error);
      return ApiResponse.error("Unable to add Expense", StatusCodes.CONFLICT);
    }
  }

  static async getExpensesByHousehold(householdId: string) {
    const expenses: Expense[] = await ExpenseRepo.getExpensesByHouseholdId(
      householdId
    );

    return ApiResponse.success(expenses);
  }

  static async delete(expenseId: string) {
    const expense = await ExpenseRepo.getExpenseByExpenseId(expenseId);

    if (!expense)
      return ApiResponse.error("Expense Not found", StatusCodes.NOT_FOUND);

    const deleteExpenseResponse = await ExpenseRepo.delete(expenseId);
    console.log("Expense Id: ", expenseId);
    console.log("deleteExpenseResponse: ", deleteExpenseResponse);

    return ApiResponse.success(
      deleteExpenseResponse,
      "Expense Deleted",
      StatusCodes.ACCEPTED
    );
  }

  static async getBalances(householdId: string) {
    const expenses = await ExpenseRepo.getExpensesWithSplits(householdId);

    if (!expenses)
      return ApiResponse.error(
        `Unable to fetch expenses for the household: ${householdId}`
      );

    const balances = calculateBalance(expenses as unknown as ExpenseDto[]);
    
    // Get all household members to include those with $0 balance
    const householdMembers = await HouseholdMemberRepo.getByHouseholdId(householdId);
    
    // If no household members found, return the calculated balances
    if (!householdMembers || householdMembers.length === 0) {
      return ApiResponse.success({
        balances: balances,
        settlements: [],
      });
    }
    
    // Create a map of existing balances
    const balanceMap = new Map(balances.map(b => [b.userId, b]));
    
    // Build complete balance list including $0 members
    const allBalances: BalanceEntry[] = householdMembers.map(member => {
      const existing = balanceMap.get(member.userId);
      return {
        userId: member.userId,
        name: member.user.name,
        balance: existing?.balance ?? 0,
      };
    });
    
    // Calculate settlements from the complete balances
    const settlements = calculateSettlements(allBalances);

    return ApiResponse.success({
      balances: allBalances,
      settlements: settlements,
    });
  }
}
