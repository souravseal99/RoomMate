import { ApiResponse } from "@common/utils/ApiResponse";
import { Role } from "@generated/prisma";
import HouseholdMember from "@common/types/HouseholdMember";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

export class HouseholdMemberService {
  static async create(userId: string, householdId?: string, role?: Role) {
    const householdMemberBody: HouseholdMember = {
      userId: userId,
      householdId: householdId,
      role: role || Role.MEMBER,
    };

    const createdHouseholdMember: HouseholdMember =
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
}
