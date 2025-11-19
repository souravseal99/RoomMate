import { Request, Response } from "express";
import { ChoreService } from "@src/chore/chore.service";
import ChoreDto from "@src/common/dtos/ChoreDto";
import UpdateChoreType from "@src/chore/types/UpdateChoreType";
import { parseDate } from "@src/common/utils/utils";

export class ChoreController {
  static async add(request: Request, response: Response) {
    const { householdId, description, frequency, assignedToId, priority, notes, nextDue } = request.body;

    const addChoreRequest: ChoreDto = {
      householdId,
      description,
      frequency,
      assignedToId,
      priority,
      notes,
      nextDue: nextDue ? parseDate(nextDue) : undefined,
    };

    const { status, message, data } = await ChoreService.add(addChoreRequest);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async completeChore(request: Request, response: Response) {
    const { choreId } = request.params;
    const { assignedToId, nextDue, completed, priority, notes, description, frequency } = request.body;

    const updateChoreRequest: UpdateChoreType = {
      assignedToId,
      nextDue,
      completed,
      choreId,
      priority,
      notes,
      description,
      frequency,
    };

    if (updateChoreRequest.nextDue)
      updateChoreRequest.nextDue = parseDate(nextDue);

    const { status, message, data } = await ChoreService.completeChore(
      updateChoreRequest
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getByHousehold(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } = await ChoreService.getByHousehold(householdId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { choreId } = request.params;

    const { status, message, data } = await ChoreService.delete(choreId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
