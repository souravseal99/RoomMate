import { Request, Response } from "express";
import { getUserFromRequestBody } from "@common/utils/utils";
import { HouseholdService } from "@src/households/household.service";

export class HouseholdController {
  static async create(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { name, settings } = request.body;

    const { status, data, message } = await HouseholdService.create(
      userId,
      name,
      settings,
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async update(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { householdId, name, settings } = request.body;

    const { status, data, message } = await HouseholdService.update(
      userId,
      householdId,
      { name, settings },
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async join(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { inviteCode } = request.params as { inviteCode: string };

    const { status, data, message } = await HouseholdService.join(
      inviteCode,
      userId,
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const { householdId } = request.body;

    const { status, data, message } = await HouseholdService.delete(
      householdId,
      userId,
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

  static async getKitchenTable(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const householdId = (request.params.householdId ||
      request.body.householdId ||
      request.query.householdId) as string;

    const { status, data, message } = await HouseholdService.getKitchenTable(
      householdId,
      userId,
    );

    return response.status(status).json({
      message,
      data,
    });
  }

  static async broadcastKitchenTable(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const householdId = (request.params.householdId ||
      request.body.householdId) as string;
    const { mode, payload, dishName, servingTime, extraPlates } = request.body;

    const { status, data, message } =
      await HouseholdService.broadcastKitchenTable(householdId, userId, {
        mode,
        payload,
        dishName,
        servingTime,
        extraPlates,
      });

    return response.status(status).json({
      message,
      data,
    });
  }

  static async toggleKitchenTableRsvp(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const householdId = (request.params.householdId ||
      request.body.householdId) as string;
    const { attending, note } = request.body;

    const { status, data, message } =
      await HouseholdService.toggleKitchenTableRsvp(
        householdId,
        userId,
        attending,
        note,
      );

    return response.status(status).json({
      message,
      data,
    });
  }

  static async acknowledgeNotice(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const householdId = (request.params.householdId ||
      request.body.householdId) as string;

    const { status, data, message } = await HouseholdService.acknowledgeNotice(
      householdId,
      userId,
    );

    return response.status(status).json({
      message,
      data,
    });
  }

  static async replyQna(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);
    const householdId = (request.params.householdId ||
      request.body.householdId) as string;
    const { text } = request.body;

    const { status, data, message } = await HouseholdService.replyQna(
      householdId,
      userId,
      text,
    );

    return response.status(status).json({
      message,
      data,
    });
  }
}
