import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { ChoreRepo } from "@src/chore/chore.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import ChoreDto from "@src/common/dtos/ChoreDto";
import UpdateChoreType from "@src/chore/types/UpdateChoreType";
import {
  calculateChoreKarma,
  getStartAndEndOfWeek,
  WeekDayMetric,
} from "@src/chore/utils";
import { ActivityService } from "@src/activities/activity.service";
import { ActivityType } from "@generated/prisma";

export class ChoreService {
  static async add(addChoreRequest: ChoreDto) {
    if (addChoreRequest.assignedToId) {
      const isMember = await HouseholdMemberRepo.isExistingUser(
        addChoreRequest.assignedToId,
        addChoreRequest.householdId,
      );
      if (!isMember) {
        return ApiResponse.error(
          "Assigned user does not belong to this household",
          StatusCodes.BAD_REQUEST,
        );
      }
    }

    if (!addChoreRequest?.nextDue) {
      addChoreRequest = {
        ...addChoreRequest,
        nextDue: new Date(),
      };
    }

    const createdChore = await ChoreRepo.create(addChoreRequest);

    return ApiResponse.success(
      createdChore,
      "Chore Created",
      StatusCodes.CREATED,
    );
  }

  static async completeChore(
    updateChoreRequest: UpdateChoreType,
    userId?: string,
  ) {
    const chore = await ChoreRepo.getChoreWithUser(
      updateChoreRequest.choreId || "",
    );

    if (!chore)
      return ApiResponse.error("Chore not found", StatusCodes.NOT_FOUND);

    if (userId) {
      const isMember = await HouseholdMemberRepo.isExistingUser(
        userId,
        chore.householdId,
      );
      if (!isMember) {
        return ApiResponse.error(
          "You do not belong to this household",
          StatusCodes.FORBIDDEN,
        );
      }
    }

    // Manual "Reschedule" flow
    if (updateChoreRequest.nextDue) {
      updateChoreRequest.nextDue = new Date(updateChoreRequest.nextDue);
    }

    const updatedChore = await ChoreRepo.update(updateChoreRequest);
    const karmaEarned = calculateChoreKarma(
      updatedChore.priority,
      updatedChore.frequency,
    );

    const targetHouseholdId = updatedChore.householdId || chore.householdId;
    const targetDescription = updatedChore.description || chore.description;

    if (
      updateChoreRequest.completed &&
      (updatedChore.assignedToId || chore.assignedToId)
    ) {
      // Remove any prior completion activity for this chore to prevent duplicates
      await ActivityService.removeChoreActivity(
        targetHouseholdId,
        updatedChore.choreId,
        targetDescription,
      );

      void ActivityService.logActivity({
        householdId: targetHouseholdId,
        userId: (updatedChore.assignedToId || chore.assignedToId)!,
        type: ActivityType.CHORE_COMPLETED,
        title: `stamped ${targetDescription}`,
        description: `+${karmaEarned} House Karma awarded`,
        metadata: {
          karma: karmaEarned,
          choreId: updatedChore.choreId,
          choreDescription: targetDescription,
        },
      });
    } else if (updateChoreRequest.completed === false) {
      // Remove completion activities when chore is unstamped
      await ActivityService.removeChoreActivity(
        targetHouseholdId,
        updatedChore.choreId,
        targetDescription,
      );
    }

    return ApiResponse.success(
      { ...updatedChore, karmaEarned },
      "Chore Updated",
      StatusCodes.ACCEPTED,
    );
  }

  static async getByHousehold(householdId: string) {
    const chores = await ChoreRepo.getByHousehold(householdId);

    return ApiResponse.success(chores, "Chores Retrieved", StatusCodes.OK);
  }

  static async getPunchcardMetrics(householdId: string, userId: string) {
    const isMember = await HouseholdMemberRepo.isExistingUser(
      userId,
      householdId,
    );
    if (!isMember) {
      return ApiResponse.error(
        "You do not belong to this household",
        StatusCodes.FORBIDDEN,
      );
    }

    const chores = await ChoreRepo.getByHousehold(householdId);
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );

    // 1. Incomplete & Completed partition
    const incompleteChores = chores
      .filter((c) => !c.completed)
      .sort((a, b) => {
        if (a.priority === "HIGH" && b.priority !== "HIGH") return -1;
        if (b.priority === "HIGH" && a.priority !== "HIGH") return 1;
        return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
      });

    const completedChores = chores
      .filter((c) => c.completed)
      .sort((a, b) => {
        const timeB = new Date(b.completedAt || b.nextDue).getTime();
        const timeA = new Date(a.completedAt || a.nextDue).getTime();
        return timeB - timeA;
      });

    // 2. Active, Next, and Recently Completed chores
    const activeChoreRaw = incompleteChores[0] || null;
    const nextChoreRaw = incompleteChores[1] || null;
    const recentCompletedRaw = completedChores[0] || null;

    const activeChore = activeChoreRaw
      ? {
          ...activeChoreRaw,
          assignedToName: activeChoreRaw.assignedTo?.name || "Flatmate",
          karma: calculateChoreKarma(
            activeChoreRaw.priority,
            activeChoreRaw.frequency,
          ),
        }
      : null;

    const nextChore = nextChoreRaw
      ? {
          ...nextChoreRaw,
          assignedToName: nextChoreRaw.assignedTo?.name || "Flatmate",
          karma: calculateChoreKarma(
            nextChoreRaw.priority,
            nextChoreRaw.frequency,
          ),
        }
      : null;

    const recentCompletedChore = recentCompletedRaw
      ? {
          ...recentCompletedRaw,
          assignedToName: recentCompletedRaw.assignedTo?.name || "Flatmate",
          karma: calculateChoreKarma(
            recentCompletedRaw.priority,
            recentCompletedRaw.frequency,
          ),
        }
      : null;

    // 3. Consecutive Daily Duty Compliance Streak
    let currentStreakDays = 0;
    const todayCompleted = completedChores.some((c) => {
      const d = c.completedAt ? new Date(c.completedAt) : new Date(c.nextDue);
      return d >= todayStart && d <= todayEnd;
    });

    if (todayCompleted) {
      currentStreakDays += 1;
    }

    for (let offset = 1; offset <= 30; offset++) {
      const dayStart = new Date(todayStart);
      dayStart.setDate(todayStart.getDate() - offset);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayChores = chores.filter((c) => {
        const due = new Date(c.nextDue);
        const compDate = c.completedAt ? new Date(c.completedAt) : null;
        return (
          (due >= dayStart && due <= dayEnd) ||
          (compDate && compDate >= dayStart && compDate <= dayEnd)
        );
      });

      if (dayChores.length === 0) {
        continue; // Rest day / grace period keeps streak alive
      }

      const hasOverdueUnfinished = dayChores.some(
        (c) => !c.completed && new Date(c.nextDue) < dayEnd,
      );
      const hasCompleted = dayChores.some((c) => c.completed);

      if (hasCompleted && !hasOverdueUnfinished) {
        currentStreakDays += 1;
      } else if (hasOverdueUnfinished) {
        break;
      }
    }

    const streakCount = Math.max(
      currentStreakDays,
      completedChores.length > 0 ? 1 : 0,
    );
    const streakLabel =
      streakCount > 0 ? `${streakCount}-Day Streak` : "House Streak";

    // 4. Dynamic 7-Day Current Week Calendar (Mon to Sun)
    const { monday } = getStartAndEndOfWeek(now);
    const weekDays: WeekDayMetric[] = ["M", "T", "W", "T", "F", "S", "S"].map(
      (dayLetter, idx) => {
        const dayDate = new Date(monday);
        dayDate.setDate(monday.getDate() + idx);
        const dayDateStart = new Date(
          dayDate.getFullYear(),
          dayDate.getMonth(),
          dayDate.getDate(),
          0,
          0,
          0,
        );
        const dayDateEnd = new Date(
          dayDate.getFullYear(),
          dayDate.getMonth(),
          dayDate.getDate(),
          23,
          59,
          59,
          999,
        );

        const isToday =
          dayDateStart.getTime() <= now.getTime() &&
          now.getTime() <= dayDateEnd.getTime();
        const isPast = dayDateEnd.getTime() < now.getTime();
        const isFuture = dayDateStart.getTime() > now.getTime();

        const dayChores = chores.filter((c) => {
          const due = new Date(c.nextDue);
          const compDate = c.completedAt ? new Date(c.completedAt) : null;
          const matchesDue = due >= dayDateStart && due <= dayDateEnd;
          const matchesCompleted = compDate
            ? compDate >= dayDateStart && compDate <= dayDateEnd
            : false;
          return matchesDue || matchesCompleted;
        });

        const dayCompletedCount = dayChores.filter((c) => c.completed).length;
        const dayTotalCount = dayChores.length;

        let status: WeekDayMetric["status"] = "rest";
        if (isToday) {
          if (dayTotalCount > 0 && dayCompletedCount === dayTotalCount) {
            status = "today-done";
          } else if (dayTotalCount > 0) {
            status = "pending";
          } else {
            status = "rest";
          }
        } else if (isPast) {
          if (dayTotalCount > 0 && dayCompletedCount === dayTotalCount) {
            status = "completed";
          } else if (dayTotalCount > 0 && dayCompletedCount < dayTotalCount) {
            status = "missed";
          } else {
            status = "rest";
          }
        } else if (isFuture) {
          status = dayTotalCount > 0 ? "upcoming" : "rest";
        }

        return {
          day: dayLetter,
          date: dayDateStart.toISOString().split("T")[0],
          isToday,
          status,
          completedCount: dayCompletedCount,
          totalCount: dayTotalCount,
        };
      },
    );

    // 5. Rhythm Percentage
    const thisWeekChores = weekDays.reduce((acc, d) => acc + d.totalCount, 0);
    const thisWeekCompleted = weekDays.reduce(
      (acc, d) => acc + d.completedCount,
      0,
    );
    const totalAllChores = chores.length;
    const totalCompletedChores = completedChores.length;

    const rhythmTotal =
      thisWeekChores > 0
        ? thisWeekChores
        : totalAllChores > 0
          ? totalAllChores
          : 1;
    const rhythmCompleted =
      thisWeekChores > 0 ? thisWeekCompleted : totalCompletedChores;
    const rhythmPercent = Math.min(
      Math.round((rhythmCompleted / rhythmTotal) * 100),
      100,
    );

    const punchcardData = {
      streak: {
        streakDays: streakCount,
        streakLabel,
      },
      rhythm: {
        totalCount: rhythmTotal,
        completedCount: rhythmCompleted,
        rhythmPercent,
        weekDays,
      },
      activeChore,
      nextChore,
      recentCompletedChore,
      nextRotationNote: nextChore
        ? {
            assigneeName: nextChore.assignedToName || "Flatmate",
            description: nextChore.description,
            nextDue: nextChore.nextDue,
          }
        : null,
    };

    return ApiResponse.success(
      punchcardData,
      "Punchcard metrics retrieved successfully",
      StatusCodes.OK,
    );
  }

  static async nudgeChore(choreId: string, userId: string) {
    const chore = await ChoreRepo.getChoreWithUser(choreId);
    if (!chore) {
      return ApiResponse.error("Chore not found", StatusCodes.NOT_FOUND);
    }

    const isMember = await HouseholdMemberRepo.isExistingUser(
      userId,
      chore.householdId,
    );
    if (!isMember) {
      return ApiResponse.error(
        "You do not belong to this household",
        StatusCodes.FORBIDDEN,
      );
    }

    if (chore.completed) {
      return ApiResponse.error(
        "This chore has already been completed",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (chore.assignedToId === userId) {
      return ApiResponse.error(
        "Cannot send a nudge for your own assigned chore",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (chore.assignedToId) {
      void ActivityService.logActivity({
        householdId: chore.householdId,
        userId: userId,
        targetUserId: chore.assignedToId,
        type: ActivityType.NUDGE,
        title: `nudged you for ${chore.description}`,
        description: "Action required 🔔",
        metadata: {
          choreId: chore.choreId,
          choreDescription: chore.description,
        },
      });
    }

    return ApiResponse.success(
      {
        choreId: chore.choreId,
        assignedTo: chore.assignedTo,
        nudgedAt: new Date().toISOString(),
      },
      `Chore nudge sent to ${chore.assignedTo?.name || "flatmate"}`,
      StatusCodes.OK,
    );
  }

  static async delete(choreId: string, userId?: string) {
    const chore = await ChoreRepo.getChoreWithUser(choreId);

    if (!chore)
      return ApiResponse.error("Chore not found", StatusCodes.NOT_FOUND);

    if (userId) {
      const isMember = await HouseholdMemberRepo.isExistingUser(
        userId,
        chore.householdId,
      );
      if (!isMember) {
        return ApiResponse.error(
          "You do not belong to this household",
          StatusCodes.FORBIDDEN,
        );
      }
    }

    await ActivityService.removeChoreActivity(
      chore.householdId,
      choreId,
      chore.description,
    );
    await ChoreRepo.delete(choreId);

    return ApiResponse.success(null, "Chore Deleted", StatusCodes.OK);
  }
}
