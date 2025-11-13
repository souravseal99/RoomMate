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

    // Manual "Reschedule" flow
    if (updateChoreRequest.nextDue) {
      updateChoreRequest.nextDue = new Date(updateChoreRequest.nextDue);
    }

    const updatedChore = await ChoreRepo.update(updateChoreRequest);

    return ApiResponse.success(
      updatedChore,
      "Chore Updated",
      StatusCodes.ACCEPTED
    );
  }

  static async getByHousehold(householdId: string) {
    const chores = await ChoreRepo.getByHousehold(householdId);

    return ApiResponse.success(
      chores,
      "Chores Retrieved",
      StatusCodes.OK
    );
  }

  static async delete(choreId: string) {
    const chore = await ChoreRepo.getChoreWithUser(choreId);

    if (!chore)
      return ApiResponse.error("Chore not found", StatusCodes.NOT_FOUND);

    await ChoreRepo.delete(choreId);

    return ApiResponse.success(
      null,
      "Chore Deleted",
      StatusCodes.OK
    );
  }
}
