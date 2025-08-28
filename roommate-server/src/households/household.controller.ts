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
}
