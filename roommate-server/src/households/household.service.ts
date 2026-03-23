import { StatusCodes } from "http-status-codes";
import { Household } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import { HouseholdRepository } from "@src/households/household.repo";
import { Role } from "@generated/prisma";
import { UserRepo } from "@src/users/user.repo";
import UserDto from "@src/common/dtos/UserDto";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { HouseholdDto } from "@src/common/dtos/HouseholdDto";

export class HouseholdService {
  static async create(userId: string, name: string) {
    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    // Fetch existing names that match the requested base name or numbered variants
    const existing = await HouseholdRepository.findNamesLikeByUser(
      userId,
      name
    );

    const baseName = name?.trim() || "";
    let finalName = baseName;

    const existingNamesSet = new Set<string>(existing.map((r) => r.name));

    if (existingNamesSet.has(finalName)) {
      let suffix = 1;
      while (true) {
        const candidate = `${baseName} (${suffix})`;
        if (!existingNamesSet.has(candidate)) {
          finalName = candidate;
          break;
        }
        suffix++;
      }
    }

    const createdHouseholdRecord: Household = await HouseholdRepository.create(
      finalName,
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

  static async delete(householdId: string) {
    const household: HouseholdDto | null =
      await HouseholdRepository.getHouseholdById(householdId);

    if (!household)
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);

    const deleteHouseholdResponse = await HouseholdRepository.delete(
      householdId
    );

    if (!deleteHouseholdResponse)
      return ApiResponse.error(
        `Unable to delete the Household: ${householdId}`,
        StatusCodes.CONFLICT
      );

    return ApiResponse.success(
      { household: deleteHouseholdResponse },
      "Household deleted successfully"
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
