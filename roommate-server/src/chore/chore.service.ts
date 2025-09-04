import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { ChoreRepo } from "@src/chore/chore.repo";
import ChoreDto from "@src/common/dtos/ChoreDto";
import UpdateChoreType from "@src/chore/types/UpdateChoreType";
import { getNextDueDate } from "./utils";

export class ChoreService {
  static async add(addChoreRequest: ChoreDto) {
    if (!addChoreRequest?.nextDue) {
      addChoreRequest = {
        ...addChoreRequest,
        nextDue: new Date(),
      };
    }

    const createdChore = await ChoreRepo.create(addChoreRequest);

    return ApiResponse.success(
      createdChore,
      "Chore Created",
      StatusCodes.CREATED
    );
  }

  static async completeChore(updateChoreRequest: UpdateChoreType) {
    const chore = await ChoreRepo.getChoreWithUser(
      updateChoreRequest.choreId || ""
    );

    if (!chore)
      return ApiResponse.error("Chore not found", StatusCodes.NOT_FOUND);

    // Manual "Complete" flow

    if (updateChoreRequest.completed === true) {
      const currentDueDate: Date = updateChoreRequest.nextDue || chore.nextDue;

      const nextDueDate: Date = getNextDueDate(currentDueDate, chore.frequency);

      updateChoreRequest.nextDue = nextDueDate;
      updateChoreRequest.completed = false;
    }

    // Manual "Reschedule" flow
    if (updateChoreRequest.nextDue) {
      updateChoreRequest.nextDue = new Date(updateChoreRequest.nextDue);
    }

    const createdChore = await ChoreRepo.update(updateChoreRequest);

    return ApiResponse.success(
      createdChore,
      "Chore Created",
      StatusCodes.ACCEPTED
    );
  }
}
