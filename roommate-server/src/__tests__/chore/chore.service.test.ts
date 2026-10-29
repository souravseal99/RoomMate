import { describe, it, expect, beforeEach, vi } from "vitest";
import { ChoreService } from "@src/chore/chore.service";
import { ChoreRepo } from "@src/chore/chore.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/chore/chore.repo");
vi.mock("@src/household-members/householdMember.repo");

describe("ChoreService Authorization & Boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("add", () => {
    it("should reject when assignedToId does not belong to the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ChoreService.add({
        description: "Wash dishes",
        householdId: "household-123",
        assignedToId: "user-outsider",
        frequency: "DAILY",
      });

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
        "user-outsider",
        "household-123",
      );
      expect(ChoreRepo.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.BAD_REQUEST,
        message: "Assigned user does not belong to this household",
      });
    });

    it("should succeed when assigned user belongs to the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);

      const mockChore = {
        choreId: "chore-1",
        description: "Wash dishes",
        householdId: "household-123",
        assignedToId: "user-member",
        frequency: "DAILY",
        nextDue: new Date(),
        completed: false,
      };

      vi.mocked(ChoreRepo.create).mockResolvedValue(mockChore as any);

      const result = await ChoreService.add({
        description: "Wash dishes",
        householdId: "household-123",
        assignedToId: "user-member",
        frequency: "DAILY",
      });

      expect(ChoreRepo.create).toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        data: mockChore,
      });
    });
  });

  describe("completeChore / update", () => {
    it("should reject when chore not found", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue(null);

      const result = await ChoreService.completeChore(
        { choreId: "nonexistent" },
        "user-1",
      );

      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "Chore not found",
      });
    });

    it("should reject with 403 when user does not belong to the chore's household", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "chore-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ChoreService.completeChore(
        { choreId: "chore-1", completed: true },
        "user-outsider",
      );

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
        "user-outsider",
        "household-123",
      );
      expect(ChoreRepo.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to the chore's household", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "chore-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(ChoreRepo.update).mockResolvedValue({
        choreId: "chore-1",
        completed: true,
      } as any);

      const result = await ChoreService.completeChore(
        { choreId: "chore-1", completed: true },
        "user-member",
      );

      expect(ChoreRepo.update).toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.ACCEPTED,
      });
    });
  });

  describe("delete", () => {
    it("should reject with 403 when user does not belong to the chore's household", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "chore-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ChoreService.delete("chore-1", "user-outsider");

      expect(ChoreRepo.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to the chore's household", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "chore-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(ChoreRepo.delete).mockResolvedValue({} as any);

      const result = await ChoreService.delete("chore-1", "user-member");

      expect(ChoreRepo.delete).toHaveBeenCalledWith("chore-1");
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Chore Deleted",
      });
    });
  });
});
