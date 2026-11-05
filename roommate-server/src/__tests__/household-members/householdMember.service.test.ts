import { describe, it, expect, beforeEach, vi } from "vitest";
import { Role } from "@generated/prisma";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/common/utils/prisma", () => ({
  default: {},
}));

vi.mock("@src/household-members/householdMember.repo");
vi.mock("@src/households/household.repo");

import { HouseholdMemberService } from "@src/household-members/householdMember.service";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { HouseholdRepository } from "@src/households/household.repo";

describe("HouseholdMemberService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHouseholdMembersByHouseholdId", () => {
    it("should reject when requester does not belong to the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result =
        await HouseholdMemberService.getHouseholdMembersByHouseholdId(
          "household-123",
          "intruder-user",
        );

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
        "intruder-user",
        "household-123",
      );
      expect(HouseholdMemberRepo.getByHouseholdId).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should reject when household does not exist", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        userId: "user-123",
        householdId: "household-nonexistent",
        role: Role.MEMBER,
      } as any);
      vi.mocked(HouseholdRepository.getHouseholdById).mockResolvedValue(null);

      const result =
        await HouseholdMemberService.getHouseholdMembersByHouseholdId(
          "household-nonexistent",
          "user-123",
        );

      expect(HouseholdRepository.getHouseholdById).toHaveBeenCalledWith(
        "household-nonexistent",
      );
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "Household not found",
      });
    });

    it("should return members when requester belongs to the household", async () => {
      const mockMembers = [
        {
          householdMemberId: "hm-1",
          userId: "user-123",
          householdId: "household-123",
          role: Role.ADMIN,
          user: { userId: "user-123", name: "Alice", email: "alice@test.com" },
        },
        {
          householdMemberId: "hm-2",
          userId: "user-456",
          householdId: "household-123",
          role: Role.MEMBER,
          user: { userId: "user-456", name: "Bob", email: "bob@test.com" },
        },
      ];

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        userId: "user-123",
        householdId: "household-123",
        role: Role.ADMIN,
      } as any);
      vi.mocked(HouseholdRepository.getHouseholdById).mockResolvedValue({
        householdId: "household-123",
        name: "Test House",
        inviteCode: "CODE123",
        createdAt: new Date(),
      } as any);
      vi.mocked(HouseholdMemberRepo.getByHouseholdId).mockResolvedValue(
        mockMembers as any,
      );

      const result =
        await HouseholdMemberService.getHouseholdMembersByHouseholdId(
          "household-123",
          "user-123",
        );

      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: mockMembers,
      });
    });
  });
});
