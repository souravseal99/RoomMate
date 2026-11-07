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

  describe("getPunchcardMetrics", () => {
    it("should reject with 403 when user is not a household member", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ChoreService.getPunchcardMetrics(
        "household-123",
        "user-outsider",
      );

      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should return calculated streak, rhythm, and karma when authorized", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);

      const mockChores = [
        {
          choreId: "c-1",
          description: "Clean Stove",
          priority: "HIGH",
          frequency: "weekly",
          completed: false,
          nextDue: new Date(),
          assignedTo: { userId: "u-1", name: "Alex" },
        },
        {
          choreId: "c-2",
          description: "Take out Trash",
          priority: "LOW",
          frequency: "daily",
          completed: true,
          completedAt: new Date(),
          nextDue: new Date(),
          assignedTo: { userId: "u-2", name: "Sam" },
        },
      ];

      vi.mocked(ChoreRepo.getByHousehold).mockResolvedValue(mockChores as any);

      const result = await ChoreService.getPunchcardMetrics(
        "household-123",
        "u-1",
      );

      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data).toBeDefined();
      expect(result.data?.streak.streakDays).toBeGreaterThanOrEqual(1);
      expect(result.data?.rhythm.weekDays).toHaveLength(7);
      expect(result.data?.activeChore?.karma).toBe(30); // 25 * 1.2 = 30
      expect(result.data?.recentCompletedChore?.karma).toBe(10); // 10 * 1.0 = 10
    });
  });

  describe("nudgeChore", () => {
    it("should reject when chore does not exist", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue(null);

      const result = await ChoreService.nudgeChore("nonexistent", "u-1");

      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "Chore not found",
      });
    });

    it("should reject when user is not in the chore household", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "c-1",
        householdId: "h-1",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ChoreService.nudgeChore("c-1", "user-outsider");

      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
      });
    });

    it("should reject when chore is already completed", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "c-1",
        householdId: "h-1",
        completed: true,
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);

      const result = await ChoreService.nudgeChore("c-1", "u-1");

      expect(result).toMatchObject({
        status: StatusCodes.BAD_REQUEST,
        message: "This chore has already been completed",
      });
    });

    it("should reject when user nudges their own chore", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "c-1",
        householdId: "h-1",
        completed: false,
        assignedToId: "u-1",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);

      const result = await ChoreService.nudgeChore("c-1", "u-1");

      expect(result).toMatchObject({
        status: StatusCodes.BAD_REQUEST,
        message: "Cannot send a nudge for your own assigned chore",
      });
    });

    it("should succeed and return nudge confirmation when valid", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "c-1",
        householdId: "h-1",
        completed: false,
        assignedToId: "u-2",
        assignedTo: { userId: "u-2", name: "Taylor" },
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);

      const result = await ChoreService.nudgeChore("c-1", "u-1");

      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: {
          choreId: "c-1",
          assignedTo: { userId: "u-2", name: "Taylor" },
        },
      });
    });
  });
});
