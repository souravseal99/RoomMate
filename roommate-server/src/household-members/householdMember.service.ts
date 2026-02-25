import { ApiResponse } from "@common/utils/ApiResponse";
import { Role } from "@generated/prisma";
import { HouseholdMemberDto } from "@common/dtos/HouseholdMemberDto";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { HouseholdRepository } from "@src/households/household.repo";
import { StatusCodes } from "http-status-codes";
import prisma from "@src/common/utils/prisma";

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

  static async leave(userId: string, householdId: string) {
    // Check if user is a member
    const membership = await HouseholdMemberRepo.isExistingUser(
      userId,
      householdId
    );

    if (!membership) {
      return ApiResponse.error(
        "Not a member of this household",
        StatusCodes.NOT_FOUND
      );
    }

    // If user is ADMIN, handle admin transfer or deletion
    if (membership.role === Role.ADMIN) {
      const otherMembers = await HouseholdMemberRepo.getByHouseholdId(householdId);
      
      if (otherMembers.length === 1) {
        // Only this admin remains - delete the household
        await HouseholdRepository.delete(householdId);
        return ApiResponse.success(
          null,
          "Left household successfully. Household deleted as you were the sole member."
        );
      } else {
        // Transfer admin to the next member
        const nextMember = otherMembers.find(m => m.userId !== userId);
        if (nextMember) {
          await prisma.householdMember.update({
            where: {
              userId_householdId: {
                userId: nextMember.userId,
                householdId,
              },
            },
            data: { role: Role.ADMIN },
          });
        }
      }
    }

    // Leave the household
    await HouseholdMemberRepo.leave(userId, householdId);
    return ApiResponse.success(null, "Left household successfully");
  }
}
