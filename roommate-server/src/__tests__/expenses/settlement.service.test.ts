import { describe, it, expect, beforeEach, vi } from "vitest";
import { SettlementService } from "@src/expenses/settlement.service";
import { SettlementRepo, SettlementDto } from "@src/expenses/settlement.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/expenses/settlement.repo");
vi.mock("@src/household-members/householdMember.repo");

describe("SettlementService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createSettlement", () => {
    const validSettlement: SettlementDto = {
      fromUserId: "user-from",
      toUserId: "user-to",
      householdId: "household-123",
      amount: 45.5,
    };

    it("should reject when debtor (fromUserId) is not a member of the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockImplementation(
        async (userId: string, _householdId: string) => {
          if (userId === "user-from") return null;
          return { householdMemberId: "hm-to" } as any;
        },
      );

      const result =
        await SettlementService.createSettlement(validSettlement);

      expect(result).toMatchObject({
        status: StatusCodes.BAD_REQUEST,
        message: "Both users must be members of the household",
      });
      expect(SettlementRepo.create).not.toHaveBeenCalled();
    });

    it("should reject when creditor (toUserId) is not a member of the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockImplementation(
        async (userId: string, _householdId: string) => {
          if (userId === "user-from")
            return { householdMemberId: "hm-from" } as any;
          return null;
        },
      );

      const result =
        await SettlementService.createSettlement(validSettlement);

      expect(result).toMatchObject({
        status: StatusCodes.BAD_REQUEST,
        message: "Both users must be members of the household",
      });
      expect(SettlementRepo.create).not.toHaveBeenCalled();
    });

    it("should successfully record settlement when both users are members of the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-valid",
      } as any);

      const mockSavedSettlement = {
        settlementId: "settlement-123",
        ...validSettlement,
        createdAt: new Date(),
      };

      vi.mocked(SettlementRepo.create).mockResolvedValue(
        mockSavedSettlement as any,
      );

      const result =
        await SettlementService.createSettlement(validSettlement);

      expect(SettlementRepo.create).toHaveBeenCalledWith(validSettlement);
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        message: "Settlement recorded successfully",
        data: mockSavedSettlement,
      });
    });
  });
});
