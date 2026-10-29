import { Request, Response } from "express";
import { ExpenseService } from "@src/expenses/expense.service";
import { SettlementService } from "@src/expenses/settlement.service";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import { getUserFromRequestBody } from "@common/utils/utils";
import { StatusCodes } from "http-status-codes";

export class ExpenseController {
  static async getExpensesByHousehold(request: Request, response: Response) {
    const { householdId } = request.params as { householdId: string };

    const { status, message, data } =
      await ExpenseService.getExpensesByHousehold(householdId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { expenseId } = request.params as { expenseId: string };

    const { status, message, data } = await ExpenseService.delete(
      expenseId,
      userId,
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getBalances(request: Request, response: Response) {
    const { householdId } = request.params as { householdId: string };

    const { status, message, data } =
      await ExpenseService.getBalances(householdId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async create(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { householdId, amount, description, sharedWith } = request.body;

    const amountInNumber = parseFloat(amount);

    const expense: ExpenseDto = {
      householdId,
      amount: amountInNumber,
      description,
      paidById: userId, // Enforce authenticated user as the payer
    };

    const { status, message, data } = await ExpenseService.create(
      expense,
      sharedWith,
    );

    return response.status(status).json({
      message: message,
      data: data,
      status,
    });
  }

  static async createSettlement(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { fromUserId, toUserId, householdId, amount } = request.body;

    // Only allow authenticated users to settle their own debts (remediate VULN-02)
    if (userId !== fromUserId) {
      return response.status(StatusCodes.FORBIDDEN).json({
        message: "You can only settle your own debts",
        data: null,
      });
    }

    const { status, message, data } = await SettlementService.createSettlement({
      fromUserId,
      toUserId,
      householdId,
      amount: parseFloat(amount),
    });

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getSettlements(request: Request, response: Response) {
    const { householdId } = request.params as { householdId: string };

    const { status, message, data } =
      await SettlementService.getSettlementsByHousehold(householdId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
