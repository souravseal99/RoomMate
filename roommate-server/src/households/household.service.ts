import { StatusCodes } from "http-status-codes";
import User from "@common/types/User";
import { Household } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import { HouseholdRepository } from "@src/households/household.repo";
import { Role } from "@generated/prisma";
import { UserRepo } from "@src/users/user.repo";

export class HouseholdService {
  static async create(userId: string, name: string) {
    const user: User | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const createdHouseholdRecord: Household = await HouseholdRepository.create(
      name,
      userId,
      Role.ADMIN
    );

    if (!createdHouseholdRecord)
      return ApiResponse.error(
        "Unable to create Household",
        StatusCodes.CONFLICT
      );

    return ApiResponse.success(
      { household: createdHouseholdRecord },
      "Household created",
      StatusCodes.CREATED
    );
  }
}
