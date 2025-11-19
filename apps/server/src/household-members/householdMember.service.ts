import { ApiResponse } from "@common/utils/ApiResponse";
import { Role } from "@generated/prisma";
import { HouseholdMemberDto } from "@common/dtos/HouseholdMemberDto";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";
import { HouseholdRepository } from "@src/households/household.repo";

export class HouseholdMemberService {
  static async create(userId: string, householdId?: string, role?: Role) {
    const householdMemberBody: HouseholdMemberDto = {
      userId: userId,
      householdId: householdId,
      role: role || Role.MEMBER,
    };

    const createdHouseholdMember: HouseholdMemberDto =
      await HouseholdMemberRepo.create(householdMemberBody);

    if (!createdHouseholdMember)
      return ApiResponse.error(
        "Unable to create household member",
        StatusCodes.CONFLICT
      );

    return ApiResponse.success(
      {
        householdMember: createdHouseholdMember,
      },
      "Successfully created household member"
    );
  }

  static async getHouseholdMembersByHouseholdId(householdId: string) {
    const household = await HouseholdRepository.getHouseholdById(householdId);

    if (!household) {
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);
    }

    const householdMembers = await HouseholdMemberRepo.getByHouseholdId(
      householdId
    );

    if (!householdMembers) {
      return ApiResponse.error(
        "No members found for this household",
        StatusCodes.NOT_FOUND
      );
    }

    return ApiResponse.success(
      householdMembers,
      "Successfully fetched household members"
    );
  }
}
