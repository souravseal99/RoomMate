import { describe, it, expect, vi, beforeEach } from "vitest";
import { ActivityService } from "@src/activities/activity.service";
import { ActivityRepo } from "@src/activities/activity.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { ActivityType } from "@generated/prisma";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/activities/activity.repo");
vi.mock("@src/household-members/householdMember.repo");
vi.mock("@common/utils/prisma", () => ({
  default: {
    householdMember: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

describe("ActivityService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getFeed", () => {
    it("should return FORBIDDEN if user is not a member of the household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ActivityService.getFeed("h-1", "user-outsider");
      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.message).toBe("You do not belong to this household");
    });

    it("should return formatted activities with properly aggregated reactions", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        householdId: "h-1",
        userId: "u-1",
        role: "MEMBER" as any,
      });
      vi.mocked(ActivityRepo.countByHousehold).mockResolvedValue(2);

      const mockRawActivities = [
        {
          activityId: "act-1",
          householdId: "h-1",
          userId: "u-2",
          targetUserId: null,
          type: ActivityType.EXPENSE,
          title: "Sarah logged $42.50 Whole Foods",
          description: "8m ago · Groceries & coffee",
          metadata: { amount: 42.5 },
          createdAt: new Date("2026-11-07T12:00:00Z"),
          user: {
            userId: "u-2",
            name: "Sarah Jenkins",
            email: "sarah@roommate.dev",
          },
          reactions: [
            {
              reactionId: "r-1",
              activityId: "act-1",
              userId: "u-1",
              emoji: "❤️",
              createdAt: new Date(),
            },
            {
              reactionId: "r-2",
              activityId: "act-1",
              userId: "u-3",
              emoji: "❤️",
              createdAt: new Date(),
            },
            {
              reactionId: "r-3",
              activityId: "act-1",
              userId: "u-4",
              emoji: "👏",
              createdAt: new Date(),
            },
          ],
        },
      ];

      vi.mocked(ActivityRepo.findFeed).mockResolvedValue(
        mockRawActivities as any,
      );

      const result = await ActivityService.getFeed("h-1", "u-1");
      expect(result.status).toBe(StatusCodes.OK);
      expect(result.data.activities).toHaveLength(1);

      const item = result.data.activities[0];
      expect(item.id).toBe("act-1");
      expect(item.type).toBe("EXPENSE");
      expect(item.totalReactionCount).toBe(3);
      expect(item.dominantEmoji).toBe("❤️");
      expect(item.userReactedEmoji).toBe("❤️");
      expect(item.userReacted).toBe(true);
      expect(item.reactions).toEqual([
        { emoji: "❤️", count: 2 },
        { emoji: "👏", count: 1 },
      ]);
    });
  });

  describe("toggleReaction", () => {
    it("should reject if user is not in household", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ActivityService.toggleReaction(
        "h-1",
        "act-1",
        "outsider",
        "❤️",
      );
      expect(result.status).toBe(StatusCodes.FORBIDDEN);
    });

    it("should reject invalid emoji", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        householdId: "h-1",
        userId: "u-1",
        role: "MEMBER" as any,
      });

      const result = await ActivityService.toggleReaction(
        "h-1",
        "act-1",
        "u-1",
        "",
      );
      expect(result.status).toBe(StatusCodes.BAD_REQUEST);
    });

    it("should add a new reaction when user had none", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        householdId: "h-1",
        userId: "u-1",
        role: "MEMBER" as any,
      });
      vi.mocked(ActivityRepo.findUserReaction).mockResolvedValue(null);
      vi.mocked(ActivityRepo.createReaction).mockResolvedValue({} as any);
      vi.mocked(ActivityRepo.getReactionsByActivity).mockResolvedValue([
        {
          reactionId: "r-1",
          activityId: "act-1",
          userId: "u-1",
          emoji: "🔥",
          createdAt: new Date(),
        },
      ]);

      const result = await ActivityService.toggleReaction(
        "h-1",
        "act-1",
        "u-1",
        "🔥",
      );
      expect(result.status).toBe(StatusCodes.OK);
      expect(ActivityRepo.createReaction).toHaveBeenCalledWith(
        "act-1",
        "u-1",
        "🔥",
      );
      expect(result.data.totalReactionCount).toBe(1);
      expect(result.data.userReactedEmoji).toBe("🔥");
      expect(result.data.dominantEmoji).toBe("🔥");
    });

    it("should replace reaction when user reacts with a different emoji (single-emoji constraint)", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        householdId: "h-1",
        userId: "u-1",
        role: "MEMBER" as any,
      });
      vi.mocked(ActivityRepo.findUserReaction).mockResolvedValue({
        reactionId: "r-1",
        activityId: "act-1",
        userId: "u-1",
        emoji: "❤️",
        createdAt: new Date(),
      });
      vi.mocked(ActivityRepo.updateReaction).mockResolvedValue({} as any);
      vi.mocked(ActivityRepo.getReactionsByActivity).mockResolvedValue([
        {
          reactionId: "r-1",
          activityId: "act-1",
          userId: "u-1",
          emoji: "👏",
          createdAt: new Date(),
        },
      ]);

      const result = await ActivityService.toggleReaction(
        "h-1",
        "act-1",
        "u-1",
        "👏",
      );
      expect(result.status).toBe(StatusCodes.OK);
      expect(ActivityRepo.updateReaction).toHaveBeenCalledWith(
        "act-1",
        "u-1",
        "👏",
      );
      expect(result.data.userReactedEmoji).toBe("👏");
    });

    it("should delete reaction (toggle off) when user reacts with the same emoji", async () => {
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
        householdId: "h-1",
        userId: "u-1",
        role: "MEMBER" as any,
      });
      vi.mocked(ActivityRepo.findUserReaction).mockResolvedValue({
        reactionId: "r-1",
        activityId: "act-1",
        userId: "u-1",
        emoji: "❤️",
        createdAt: new Date(),
      });
      vi.mocked(ActivityRepo.deleteReaction).mockResolvedValue({} as any);
      vi.mocked(ActivityRepo.getReactionsByActivity).mockResolvedValue([]);

      const result = await ActivityService.toggleReaction(
        "h-1",
        "act-1",
        "u-1",
        "❤️",
      );
      expect(result.status).toBe(StatusCodes.OK);
      expect(ActivityRepo.deleteReaction).toHaveBeenCalledWith("act-1", "u-1");
      expect(result.data.totalReactionCount).toBe(0);
      expect(result.data.userReactedEmoji).toBeNull();
      expect(result.data.userReacted).toBe(false);
    });
  });
});
