import { StatusCodes } from "http-status-codes";
import { Expense } from "@generated/prisma";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { ExpenseSplitService } from "@src/expense-split/expenseSplit.service";
import { ExpenseRepo } from "@src/expenses/expense.repo";
import { SettlementRepo } from "@src/expenses/settlement.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import calculateBalance, {
  calculateSettlements,
  BalanceEntry,
} from "@src/expenses/calculateBalance";
import { HouseholdRepository } from "@src/households/household.repo";
import { ActivityService } from "@src/activities/activity.service";
import { ActivityType } from "@generated/prisma";

export class ExpenseService {
  static async create(expense: ExpenseDto, sharedWith?: string[]) {
    const isHouseholdMember = await HouseholdMemberRepo.isExistingUser(
      expense.paidById,
      expense.householdId,
    );

    if (!isHouseholdMember)
      return ApiResponse.error("User is not a member of the household");

    // If sharedWith is undefined, default to splitting equally across all active household members
    let resolvedSharedWith = sharedWith;
    if (resolvedSharedWith === undefined) {
      const householdMembers = await HouseholdMemberRepo.getByHouseholdId(
        expense.householdId,
      );
      resolvedSharedWith = (householdMembers || []).map((m) => m.userId);
    }

    if (resolvedSharedWith && resolvedSharedWith.length > 0) {
      for (const splitUserId of resolvedSharedWith) {
        const isMember = await HouseholdMemberRepo.isExistingUser(
          splitUserId,
          expense.householdId,
        );
        if (!isMember) {
          return ApiResponse.error(
            "One or more split users do not belong to this household",
            StatusCodes.BAD_REQUEST,
          );
        }
      }
    }

    try {
      const createdExpense: Expense = await ExpenseRepo.create(expense);

      void ActivityService.logActivity({
        householdId: expense.householdId,
        userId: expense.paidById,
        type: ActivityType.EXPENSE,
        title: `logged $${createdExpense.amount.toFixed(2)} ${createdExpense.description}`,
        description: `${createdExpense.description}`,
        metadata: {
          amount: createdExpense.amount,
          expenseId: createdExpense.expenseId,
          description: createdExpense.description,
        },
      });

      if (!resolvedSharedWith || !resolvedSharedWith?.length) {
        return ApiResponse.success(
          createdExpense,
          "Expense added",
          StatusCodes.CREATED,
        );
      } else {
        const shareAmount = createdExpense.amount / resolvedSharedWith.length;

        const splits: ExpenseSplitDto[] = resolvedSharedWith.map((userId) => ({
          expenseId: createdExpense.expenseId,
          userId: userId,
          shareAmount: shareAmount,
        }));

        const createdSplits = await ExpenseSplitService.bulkCreate(splits);

        return ApiResponse.success(
          { createdExpense: createdExpense, createdSplits: createdSplits },
          "Added Expense with Expense split",
          StatusCodes.CREATED,
        );
      }
    } catch (error) {
      console.error(error);
      return ApiResponse.error("Unable to add Expense", StatusCodes.CONFLICT);
    }
  }

  static async getExpensesByHousehold(householdId: string) {
    const expenses: Expense[] =
      await ExpenseRepo.getExpensesByHouseholdId(householdId);

    return ApiResponse.success(expenses);
  }

  static async delete(expenseId: string, userId?: string) {
    const expense = await ExpenseRepo.getExpenseByExpenseId(expenseId);

    if (!expense)
      return ApiResponse.error("Expense Not found", StatusCodes.NOT_FOUND);

    if (userId && expense.paidById !== userId) {
      return ApiResponse.error(
        "You can only modify or delete your own expenses",
        StatusCodes.FORBIDDEN,
      );
    }

    const deleteExpenseResponse = await ExpenseRepo.delete(expenseId);

    return ApiResponse.success(
      deleteExpenseResponse,
      "Expense Deleted",
      StatusCodes.ACCEPTED,
    );
  }

  static async getBalances(householdId: string) {
    const expenses = await ExpenseRepo.getExpensesWithSplits(householdId);

    if (!expenses)
      return ApiResponse.error(
        `Unable to fetch expenses for the household: ${householdId}`,
      );

    const balances = calculateBalance(expenses as unknown as ExpenseDto[]);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    // Fetch household members, settlements, settings, spend, and recent bills in parallel
    const [
      householdMembers,
      settlements,
      household,
      monthlySpend,
      recentBillsRaw,
    ] = await Promise.all([
      HouseholdMemberRepo.getByHouseholdId(householdId),
      SettlementRepo.getByHouseholdId(householdId),
      HouseholdRepository.getHouseholdById(householdId),
      ExpenseRepo.getMonthlyHouseholdSpend(
        householdId,
        startOfMonth,
        endOfMonth,
      ),
      ExpenseRepo.getRecentSharedBills(householdId, 2),
    ]);

    const recentBills = (recentBillsRaw || []).map((b) => {
      const splitCount = b.splits && b.splits.length > 0 ? b.splits.length : 1;
      const userShare = Math.round((b.amount / splitCount) * 100) / 100;
      return {
        id: b.expenseId,
        description: b.description,
        payerName: b.paidBy?.name || "Roommate",
        payerInitial: (b.paidBy?.name || "R").charAt(0).toUpperCase(),
        totalAmount: b.amount,
        userShare,
        splitCount,
        createdAt: b.createdAt,
      };
    });

    const settings = (household?.settings as Record<string, any>) || {};
    const monthlyBudget = Number(settings.monthlyCommunalBudget) || 1800;
    const budgetPercent = Math.min(
      Math.round(((monthlySpend || 0) / (monthlyBudget || 1)) * 100),
      100,
    );
    const budget = {
      spent: Math.round((monthlySpend || 0) * 100) / 100,
      total: monthlyBudget,
      percent: budgetPercent,
    };

    // If no household members found, return the calculated balances
    if (!householdMembers || householdMembers.length === 0) {
      return ApiResponse.success({
        balances: balances,
        settlements: [],
        recentBills,
        budget,
      });
    }

    // Create a map of existing balances
    const balanceMap = new Map(balances.map((b) => [b.userId, b]));

    // Build complete balance list including $0 members
    let allBalances: BalanceEntry[] = householdMembers.map((member) => {
      const existing = balanceMap.get(member.userId);
      return {
        userId: member.userId,
        name: member.user.name,
        balance: existing?.balance ?? 0,
      };
    });

    // Get settlements and subtract them from balances
    if (settlements && settlements.length > 0) {
      // Create a mutable copy of balances
      const balanceAdjustmentMap = new Map<string, number>();

      // Calculate settlement adjustments
      settlements.forEach((settlement) => {
        // fromUser paid, so their balance increases (less negative/more positive)
        const currentFrom =
          balanceAdjustmentMap.get(settlement.fromUserId) ?? 0;
        balanceAdjustmentMap.set(
          settlement.fromUserId,
          currentFrom + settlement.amount,
        );

        // toUser received, so their balance decreases (more negative/less positive)
        const currentTo = balanceAdjustmentMap.get(settlement.toUserId) ?? 0;
        balanceAdjustmentMap.set(
          settlement.toUserId,
          currentTo - settlement.amount,
        );
      });

      // Apply adjustments to balances
      allBalances = allBalances.map((entry) => {
        const adjustment = balanceAdjustmentMap.get(entry.userId) ?? 0;
        return {
          ...entry,
          balance: Math.round((entry.balance + adjustment) * 100) / 100,
        };
      });
    }

    // Recalculate settlements from the adjusted balances
    const adjustedSettlements = calculateSettlements(allBalances);

    return ApiResponse.success({
      balances: allBalances,
      settlements: adjustedSettlements,
      recentBills,
      budget,
    });
  }
}
