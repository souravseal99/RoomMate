import { Request, Response } from "express";
import { ExpenseService } from "@src/expenses/expense.service";
import ExpenseDto from "@src/common/dtos/ExpenseDto";

export class ExpenseController {
  static async getExpensesByHousehold(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } =
      await ExpenseService.getExpensesByHousehold(householdId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { expenseId } = request.params;

    const { status, message, data } = await ExpenseService.delete(expenseId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getBalances(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } = await ExpenseService.getBalances(
      householdId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async create(request: Request, response: Response) {
    const { householdId, amount, description, paidById, sharedWith } =
      request.body;

    //TODO - add validaiton

    const amountInNumber = parseFloat(amount);

    const expense: ExpenseDto = {
      householdId,
      amount: amountInNumber,
      description,
      paidById,
    };

    const { status, message, data } = await ExpenseService.create(
      expense,
      sharedWith
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
