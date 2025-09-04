import { StatusCodes } from "http-status-codes";
import { Household } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import { HouseholdRepository } from "@src/households/household.repo";
import { Role } from "@generated/prisma";
import { UserRepo } from "@src/users/user.repo";
import UserDto from "@src/common/dtos/UserDto";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";

export class HouseholdService {
  static async create(userId: string, name: string) {
    const user: UserDto | null = await UserRepo.getUserById(userId);

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

  static async getHouseholdsByUser(userId: string) {
    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const householdRecords = await HouseholdRepository.getHouseholdsByUser(
      userId
    );

    if (!householdRecords)
      return ApiResponse.error(
        `Unable to fetch Households for the user: ${userId}`,
        StatusCodes.CONFLICT
      );

    return ApiResponse.success(
      { household: householdRecords },
      `Households for the user: ${user.name}`
    );
  }

  static async join(inviteCode: string, userId: string) {
    const household: Household | null =
      await HouseholdRepository.getHouseholdByInviteCode(inviteCode);

    if (!household)
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);

    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const isExistingUser = await HouseholdMemberRepo.isExistingUser(
      userId,
      household.householdId
    );

    if (isExistingUser)
      return ApiResponse.error(
        `User already exists in this household: ${household.householdId}`,
        StatusCodes.CONFLICT,
        {
          userId: userId,
          householdId: household.householdId,
          householdName: household.name,
        }
      );

    const joinedHousehold = await HouseholdMemberRepo.join(
      userId,
      household.householdId
    );

    if (!joinedHousehold)
      return ApiResponse.error(
        "Unable to join the Household",
        StatusCodes.CONFLICT
      );

    return ApiResponse.success(
      { household: { ...joinedHousehold, householdName: household.name } },
      "Joined the Household",
      StatusCodes.CREATED
    );
  }
}
