import { Request, Response } from "express";
import { ChoreService } from "@src/chore/chore.service";
import ChoreDto from "@src/common/dtos/ChoreDto";
import UpdateChoreType from "@src/chore/types/UpdateChoreType";
import { parseDate } from "@src/common/utils/utils";

export class ChoreController {
  static async add(request: Request, response: Response) {
    const { householdId, description, frequency, assignedToId } = request.body;

    const addChoreRequest: ChoreDto = {
      householdId,
      description,
      frequency,
      assignedToId,
    };

    const { status, message, data } = await ChoreService.add(addChoreRequest);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async completeChore(request: Request, response: Response) {
    const { choreId } = request.params;
    const { assignedToId, nextDue, completed } = request.body;

    const updateChoreRequest: UpdateChoreType = {
      assignedToId,
      nextDue,
      completed,
      choreId,
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
}
