import { StatusCodes } from "http-status-codes";
import { SettlementRepo, SettlementDto } from "@src/expenses/settlement.repo";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";

export class SettlementService {
  static async createSettlement(settlement: SettlementDto) {
    // Validate that both users are household members
    const fromIsMember = await HouseholdMemberRepo.isExistingUser(
      settlement.fromUserId,
      settlement.householdId,
    );
    const toIsMember = await HouseholdMemberRepo.isExistingUser(
      settlement.toUserId,
      settlement.householdId,
    );

    if (!fromIsMember || !toIsMember) {
      return ApiResponse.error(
        "Both users must be members of the household",
        StatusCodes.BAD_REQUEST,
      );
    }

    try {
      const createdSettlement = await SettlementRepo.create(settlement);

      return ApiResponse.success(
        createdSettlement,
        "Settlement recorded successfully",
        StatusCodes.CREATED,
      );
    } catch (error) {
      console.error("Error creating settlement:", error);
      return ApiResponse.error(
        "Unable to create settlement",
        StatusCodes.CONFLICT,
      );
    }
  }

  static async getSettlementsByHousehold(householdId: string) {
    try {
      const settlements = await SettlementRepo.getByHouseholdId(householdId);
      return ApiResponse.success(settlements);
    } catch (error) {
      console.error("Error fetching settlements:", error);
      return ApiResponse.error(
        "Unable to fetch settlements",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
