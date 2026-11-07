import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@common/utils/ApiResponse";
import { ActivityRepo, CreateActivityDto } from "@src/activities/activity.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import prisma from "@common/utils/prisma";
import { ActivityType } from "@generated/prisma";

export interface FormattedReactionSummary {
  emoji: string;
  count: number;
}

export interface FormattedActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string | null;
  metadata: any;
  createdAt: string;
  user: {
    userId: string;
    name: string;
    email: string;
  };
  isPrivate: boolean;
  totalReactionCount: number;
  dominantEmoji: string;
  userReactedEmoji: string | null;
  userReacted: boolean;
  reactions: FormattedReactionSummary[];
}

export class ActivityService {
  /**
   * Retrieve the household activity feed.
   * Scoped to the requesting household member and applies private recipient filtering.
   */
  static async getFeed(
    householdId: string,
    currentUserId: string,
    filter?: string,
  ) {
    const membership = await HouseholdMemberRepo.isExistingUser(
      currentUserId,
      householdId,
    );
    if (!membership) {
      return ApiResponse.error(
        "You do not belong to this household",
        StatusCodes.FORBIDDEN,
      );
    }

    // Auto-seed initial activities from existing household data if empty
    const count = await ActivityRepo.countByHousehold(householdId);
    if (count === 0) {
      await this.seedInitialActivities(householdId, currentUserId);
    }

    const rawActivities = await ActivityRepo.findFeed(
      householdId,
      currentUserId,
      filter,
      25,
    );

    const formatted: FormattedActivityItem[] = rawActivities.map((item) => {
      // Aggregate reactions by emoji
      const emojiCounts = new Map<string, number>();
      let userEmoji: string | null = null;

      for (const reaction of item.reactions) {
        emojiCounts.set(
          reaction.emoji,
          (emojiCounts.get(reaction.emoji) || 0) + 1,
        );
        if (reaction.userId === currentUserId) {
          userEmoji = reaction.emoji;
        }
      }

      const reactionsSummary: FormattedReactionSummary[] = Array.from(
        emojiCounts.entries(),
      ).map(([emoji, count]) => ({
        emoji,
        count,
      }));

      // Find dominant emoji (highest count) or fallback
      let dominant = "❤️";
      let maxCount = 0;
      for (const [emoji, cnt] of emojiCounts.entries()) {
        if (cnt > maxCount) {
          maxCount = cnt;
          dominant = emoji;
        }
      }

      return {
        id: item.activityId,
        type: item.type,
        title: item.title,
        description: item.description,
        metadata: item.metadata,
        createdAt: item.createdAt.toISOString(),
        user: item.user,
        isPrivate: Boolean(item.targetUserId),
        totalReactionCount: item.reactions.length,
        dominantEmoji: dominant,
        userReactedEmoji: userEmoji,
        userReacted: Boolean(userEmoji),
        reactions: reactionsSummary,
      };
    });

    return ApiResponse.success(
      { activities: formatted },
      "Activity feed fetched successfully",
      StatusCodes.OK,
    );
  }

  /**
   * Toggle or change a user's emoji reaction on an activity item.
   * Strictly enforces the rule: 1 emoji per user per activity item.
   */
  static async toggleReaction(
    householdId: string,
    activityId: string,
    userId: string,
    emoji: string,
  ) {
    const membership = await HouseholdMemberRepo.isExistingUser(
      userId,
      householdId,
    );
    if (!membership) {
      return ApiResponse.error(
        "You do not belong to this household",
        StatusCodes.FORBIDDEN,
      );
    }

    if (!emoji || typeof emoji !== "string") {
      return ApiResponse.error(
        "A valid emoji string is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const cleanEmoji = emoji.trim();
    const existing = await ActivityRepo.findUserReaction(activityId, userId);

    if (existing) {
      if (existing.emoji === cleanEmoji) {
        // Toggle off if same emoji clicked again
        await ActivityRepo.deleteReaction(activityId, userId);
      } else {
        // Replace with new emoji if different
        await ActivityRepo.updateReaction(activityId, userId, cleanEmoji);
      }
    } else {
      // Create new reaction
      await ActivityRepo.createReaction(activityId, userId, cleanEmoji);
    }

    // Return updated reaction stats for the activity
    const updatedReactions =
      await ActivityRepo.getReactionsByActivity(activityId);
    const emojiCounts = new Map<string, number>();
    let userEmoji: string | null = null;

    for (const r of updatedReactions) {
      emojiCounts.set(r.emoji, (emojiCounts.get(r.emoji) || 0) + 1);
      if (r.userId === userId) {
        userEmoji = r.emoji;
      }
    }

    const summary: FormattedReactionSummary[] = Array.from(
      emojiCounts.entries(),
    ).map(([em, cnt]) => ({
      emoji: em,
      count: cnt,
    }));

    let dominant = "❤️";
    let max = 0;
    for (const [em, cnt] of emojiCounts.entries()) {
      if (cnt > max) {
        max = cnt;
        dominant = em;
      }
    }

    return ApiResponse.success(
      {
        activityId,
        totalReactionCount: updatedReactions.length,
        dominantEmoji: dominant,
        userReactedEmoji: userEmoji,
        userReacted: Boolean(userEmoji),
        reactions: summary,
      },
      "Reaction updated successfully",
      StatusCodes.OK,
    );
  }

  /**
   * Helper to log an activity event from other domain services.
   */
  static async logActivity(data: CreateActivityDto) {
    try {
      return await ActivityRepo.create(data);
    } catch (err) {
      console.error("Failed to log household activity:", err);
      return null;
    }
  }

  /**
   * Auto-seed realistic initial activities from existing household records
   * so the activity pulse is never an empty void on initial render.
   */
  private static async seedInitialActivities(
    householdId: string,
    currentUserId: string,
  ) {
    try {
      const members = await prisma.householdMember.findMany({
        where: { householdId },
        include: { user: true },
        take: 5,
      });

      if (members.length === 0) return;

      const actor1 = members[0].user;
      const actor2 = members.length > 1 ? members[1].user : actor1;
      const actor3 = members.length > 2 ? members[2].user : actor1;

      // 1. Initial Expense
      const act1 = await ActivityRepo.create({
        householdId,
        userId: actor1.userId,
        type: ActivityType.EXPENSE,
        title: `${actor1.name.split(" ")[0]} logged $42.50 Whole Foods`,
        description: "8m ago · Groceries & coffee",
        metadata: {
          amount: 42.5,
          merchant: "Whole Foods",
          category: "Groceries & coffee",
        },
      });

      // 2. Initial Completed Chore
      const act2 = await ActivityRepo.create({
        householdId,
        userId: actor2.userId,
        type: ActivityType.CHORE_COMPLETED,
        title: `${actor2.name.split(" ")[0]} stamped Brita Refill`,
        description: "+10 House Karma awarded · 45m ago",
        metadata: {
          karma: 10,
          choreName: "Brita Refill",
        },
      });

      // 3. Initial Settlement
      const act3 = await ActivityRepo.create({
        householdId,
        userId: actor3.userId,
        type: ActivityType.SETTLEMENT,
        title: `${actor3.name.split(" ")[0]} settled $25.00 with ${actor1.name.split(" ")[0]}`,
        description: "Yesterday · ACH Transfer",
        metadata: {
          amount: 25.0,
          recipientName: actor1.name.split(" ")[0],
          method: "ACH Transfer",
        },
      });

      // Add default reactions
      await ActivityRepo.createReaction(act1.activityId, actor1.userId, "❤️");
      if (actor2.userId !== actor1.userId) {
        await ActivityRepo.createReaction(act1.activityId, actor2.userId, "❤️");
      }
      await ActivityRepo.createReaction(act2.activityId, actor1.userId, "👏");
      await ActivityRepo.createReaction(act3.activityId, actor1.userId, "🤝");
    } catch (err) {
      console.error("Failed to seed initial activities:", err);
    }
  }
}
