import { Request, Response } from "express";
import { getUserFromRequestBody } from "@common/utils/utils";
import { HouseholdService } from "@src/households/household.service";

export class HouseholdController {
  static async create(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { name } = request.body;

    const { status, data, message } = await HouseholdService.create(
      userId,
      name
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async join(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { inviteCode } = request.params;

    const { status, data, message } = await HouseholdService.join(
      inviteCode,
      userId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { householdId } = request.body;

    const { status, data, message } = await HouseholdService.delete(
      householdId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getHouseholdsByUser(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);

    const { status, data, message } =
      await HouseholdService.getHouseholdsByUser(userId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
