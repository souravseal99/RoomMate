import prisma from "@common/utils/prisma";
import { ActivityType, Prisma } from "@generated/prisma";

export interface CreateActivityDto {
  householdId: string;
  userId: string;
  targetUserId?: string | null;
  type: ActivityType;
  title: string;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
}

export class ActivityRepo {
  /**
   * Log a new household activity event.
   */
  static async create(data: CreateActivityDto) {
    return await prisma.activity.create({
      data: {
        householdId: data.householdId,
        userId: data.userId,
        targetUserId: data.targetUserId ?? null,
        type: data.type,
        title: data.title,
        description: data.description ?? null,
        metadata: data.metadata ?? {},
      },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
        reactions: true,
      },
    });
  }

  /**
   * Fetch household activity feed scoped to the household and recipient.
   * Private events (e.g. nudges) are only returned if targetUserId is null or matches currentUserId.
   */
  static async findFeed(
    householdId: string,
    currentUserId: string,
    filter?: string,
    limit = 20,
  ) {
    const typeFilter =
      filter && filter !== "all"
        ? (filter.toUpperCase() as ActivityType)
        : undefined;

    return await prisma.activity.findMany({
      where: {
        householdId,
        OR: [{ targetUserId: null }, { targetUserId: currentUserId }],
        ...(typeFilter ? { type: typeFilter } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
        reactions: {
          select: {
            reactionId: true,
            activityId: true,
            userId: true,
            emoji: true,
            createdAt: true,
          },
        },
      },
    });
  }

  /**
   * Check total count of activities for a household.
   */
  static async countByHousehold(householdId: string): Promise<number> {
    return await prisma.activity.count({
      where: { householdId },
    });
  }

  /**
   * Find an existing reaction by user on an activity.
   */
  static async findUserReaction(activityId: string, userId: string) {
    return await prisma.activityReaction.findUnique({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
    });
  }

  /**
   * Add a new emoji reaction.
   */
  static async createReaction(
    activityId: string,
    userId: string,
    emoji: string,
  ) {
    return await prisma.activityReaction.create({
      data: {
        activityId,
        userId,
        emoji,
      },
    });
  }

  /**
   * Update an existing reaction with a new emoji (replaces existing).
   */
  static async updateReaction(
    activityId: string,
    userId: string,
    emoji: string,
  ) {
    return await prisma.activityReaction.update({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
      data: { emoji },
    });
  }

  /**
   * Delete an existing reaction (toggles reaction off).
   */
  static async deleteReaction(activityId: string, userId: string) {
    return await prisma.activityReaction.delete({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
    });
  }

  /**
   * Fetch all reactions for an activity.
   */
  static async getReactionsByActivity(activityId: string) {
    return await prisma.activityReaction.findMany({
      where: { activityId },
    });
  }

  /**
   * Delete an activity by its ID.
   */
  static async deleteById(activityId: string) {
    return await prisma.activity.delete({
      where: { activityId },
    });
  }

  /**
   * Delete activity events related to a chore (e.g. when unstamped or deleted).
   */
  static async deleteByChore(
    householdId: string,
    choreId: string,
    choreDescription?: string,
  ) {
    const activities = await prisma.activity.findMany({
      where: {
        householdId,
        type: ActivityType.CHORE_COMPLETED,
      },
      select: {
        activityId: true,
        title: true,
        metadata: true,
      },
    });

    const idsToDelete = activities
      .filter((a) => {
        const meta = a.metadata as Record<string, any> | null;
        if (meta?.choreId && meta.choreId === choreId) return true;
        if (
          choreDescription &&
          a.title.toLowerCase().includes(choreDescription.toLowerCase())
        ) {
          return true;
        }
        return false;
      })
      .map((a) => a.activityId);

    if (idsToDelete.length > 0) {
      return await prisma.activity.deleteMany({
        where: {
          activityId: { in: idsToDelete },
        },
      });
    }

    return { count: 0 };
  }
}
