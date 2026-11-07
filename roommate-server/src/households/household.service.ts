import { StatusCodes } from "http-status-codes";
import { Household } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import { HouseholdRepository } from "@src/households/household.repo";
import { Role } from "@generated/prisma";
import { UserRepo } from "@src/users/user.repo";
import UserDto from "@src/common/dtos/UserDto";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { HouseholdDto } from "@src/common/dtos/HouseholdDto";

export class HouseholdService {
  static async create(userId: string, name: string, settings?: any) {
    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    // Fetch existing names that match the requested base name or numbered variants
    const existing = await HouseholdRepository.findNamesLikeByUser(
      userId,
      name,
    );

    const baseName = name?.trim() || "";
    let finalName = baseName;

    const existingNamesSet = new Set<string>(existing.map((r) => r.name));

    if (existingNamesSet.has(finalName)) {
      let suffix = 1;
      while (true) {
        const candidate = `${baseName} (${suffix})`;
        if (!existingNamesSet.has(candidate)) {
          finalName = candidate;
          break;
        }
        suffix++;
      }
    }

    const createdHouseholdRecord: Household =
      settings !== undefined
        ? await HouseholdRepository.create(
            finalName,
            userId,
            Role.ADMIN,
            settings,
          )
        : await HouseholdRepository.create(finalName, userId, Role.ADMIN);

    if (!createdHouseholdRecord)
      return ApiResponse.error(
        "Unable to create Household",
        StatusCodes.CONFLICT,
      );

    return ApiResponse.success(
      { household: createdHouseholdRecord },
      "Household created",
      StatusCodes.CREATED,
    );
  }

  static async update(
    userId: string,
    householdId: string,
    updateData: { name?: string; settings?: any },
  ) {
    if (!householdId) {
      return ApiResponse.error(
        "Household ID is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const membership = await HouseholdMemberRepo.isExistingUser(
      userId,
      householdId,
    );
    if (!membership) {
      return ApiResponse.error(
        "You are not a member of this household",
        StatusCodes.FORBIDDEN,
      );
    }

    if (membership.role !== Role.ADMIN) {
      return ApiResponse.error(
        "Only space administrators can modify household settings",
        StatusCodes.FORBIDDEN,
      );
    }

    const updated = await HouseholdRepository.update(householdId, updateData);
    if (!updated) {
      return ApiResponse.error(
        "Failed to update household",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    return ApiResponse.success(
      { household: updated },
      "Household settings updated successfully",
      StatusCodes.OK,
    );
  }

  static async getHouseholdsByUser(userId: string) {
    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const householdRecords =
      await HouseholdRepository.getHouseholdsByUser(userId);

    if (!householdRecords)
      return ApiResponse.error(
        `Unable to fetch Households for the user: ${userId}`,
        StatusCodes.CONFLICT,
      );

    return ApiResponse.success(
      { household: householdRecords },
      `Households for the user: ${user.name}`,
    );
  }

  static async delete(householdId: string, userId?: string) {
    if (userId) {
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

      if (membership.role !== Role.ADMIN) {
        return ApiResponse.error(
          "Only space administrators can delete a household",
          StatusCodes.FORBIDDEN,
        );
      }
    }

    const household: HouseholdDto | null =
      await HouseholdRepository.getHouseholdById(householdId);

    if (!household)
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);

    const deleteHouseholdResponse =
      await HouseholdRepository.delete(householdId);

    if (!deleteHouseholdResponse)
      return ApiResponse.error(
        `Unable to delete the Household: ${householdId}`,
        StatusCodes.CONFLICT,
      );

    return ApiResponse.success(
      { household: deleteHouseholdResponse },
      "Household deleted successfully",
    );
  }

  static async join(inviteCode: string, userId: string) {
    const household: Household | null =
      await HouseholdRepository.getHouseholdByInviteCode(inviteCode);

    if (!household)
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);

    const user: UserDto | null = await UserRepo.getUserById(userId);

    if (!user)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const isExistingUser = await HouseholdMemberRepo.isExistingUser(
      userId,
      household.householdId,
    );

    if (isExistingUser)
      return ApiResponse.error(
        `User already exists in this household: ${household.householdId}`,
        StatusCodes.CONFLICT,
        {
          userId: userId,
          householdId: household.householdId,
          householdName: household.name,
        },
      );

    const joinedHousehold = await HouseholdMemberRepo.join(
      userId,
      household.householdId,
    );

    if (!joinedHousehold)
      return ApiResponse.error(
        "Unable to join the Household",
        StatusCodes.CONFLICT,
      );

    return ApiResponse.success(
      { household: { ...joinedHousehold, householdName: household.name } },
      "Joined the Household",
      StatusCodes.CREATED,
    );
  }

  static async getKitchenTable(householdId: string, userId: string) {
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

    const rawData = await HouseholdRepository.getKitchenTable(householdId);
    if (!rawData) {
      return ApiResponse.success(
        { kitchenTable: null },
        "Kitchen table retrieved successfully",
      );
    }

    // Normalize legacy single-meal object if activeMode is not set
    if (!rawData.activeMode && rawData.dishName) {
      return ApiResponse.success(
        {
          kitchenTable: {
            activeMode: "CHEF",
            meal: rawData,
            ...rawData,
            updatedAt: rawData.broadcastAt || new Date().toISOString(),
          },
        },
        "Kitchen table retrieved successfully",
      );
    }

    return ApiResponse.success(
      { kitchenTable: rawData },
      "Kitchen table retrieved successfully",
    );
  }

  static async broadcastKitchenTable(
    householdId: string,
    userId: string,
    dto: {
      mode?: "CHEF" | "QNA" | "NOTICE";
      payload?: any;
      dishName?: string;
      servingTime?: string;
      extraPlates?: number;
    },
  ) {
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

    const user = await UserRepo.getUserById(userId);
    const authorName = user?.name || "Roommate";
    const rawData =
      (await HouseholdRepository.getKitchenTable(householdId)) || {};
    const baseKitchenTable = rawData.activeMode
      ? rawData
      : rawData.dishName
        ? { activeMode: "CHEF", meal: rawData }
        : {};

    const mode = dto.mode || "CHEF";

    if (mode === "NOTICE") {
      const noticeTitle = dto.payload?.title || dto.dishName;
      if (
        !noticeTitle ||
        typeof noticeTitle !== "string" ||
        !noticeTitle.trim()
      ) {
        return ApiResponse.error(
          "Notice title is required",
          StatusCodes.BAD_REQUEST,
        );
      }

      const urgency = dto.payload?.urgency || "GENERAL";
      const newNotice = {
        noticeId: `nt_${Date.now()}`,
        title: noticeTitle.trim(),
        urgency,
        authorId: userId,
        authorName,
        broadcastAt: new Date().toISOString(),
        acknowledgments: [
          {
            userId,
            userName: authorName,
            acknowledgedAt: new Date().toISOString(),
          },
        ],
      };

      const updatedTable = {
        ...baseKitchenTable,
        activeMode: "NOTICE",
        notice: newNotice,
        updatedAt: new Date().toISOString(),
      };

      await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

      return ApiResponse.success(
        { kitchenTable: updatedTable },
        "Notice broadcasted successfully",
        StatusCodes.OK,
      );
    }

    if (mode === "QNA") {
      const questionText = dto.payload?.question || dto.dishName;
      if (
        !questionText ||
        typeof questionText !== "string" ||
        !questionText.trim()
      ) {
        return ApiResponse.error(
          "Question text is required",
          StatusCodes.BAD_REQUEST,
        );
      }

      const category = dto.payload?.category || "General";
      const newQna = {
        qnaId: `qna_${Date.now()}`,
        question: questionText.trim(),
        category,
        authorId: userId,
        authorName,
        broadcastAt: new Date().toISOString(),
        replies: [],
      };

      const updatedTable = {
        ...baseKitchenTable,
        activeMode: "QNA",
        qna: newQna,
        updatedAt: new Date().toISOString(),
      };

      await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

      return ApiResponse.success(
        { kitchenTable: updatedTable },
        "Question broadcasted successfully",
        StatusCodes.OK,
      );
    }

    // Default: CHEF mode
    const dishName = dto.payload?.dishName || dto.dishName;
    if (!dishName || typeof dishName !== "string" || !dishName.trim()) {
      return ApiResponse.error(
        "Dish name is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const servingTime =
      (dto.payload?.servingTime || dto.servingTime)?.trim() || "8:00 PM";
    const rawPlates =
      dto.payload?.extraPlates !== undefined
        ? dto.payload.extraPlates
        : dto.extraPlates;
    const extraPlates =
      typeof rawPlates === "number" ? Math.max(0, rawPlates) : 0;

    const newMeal = {
      dishName: dishName.trim(),
      servingTime,
      extraPlates,
      chefId: userId,
      chefName: authorName,
      broadcastAt: new Date().toISOString(),
      status: "ACTIVE" as const,
      rsvps: [
        {
          userId,
          userName: authorName,
          attending: true,
          note: "Chef (Preparing)",
          updatedAt: new Date().toISOString(),
        },
      ],
    };

    const updatedTable = {
      ...baseKitchenTable,
      activeMode: "CHEF",
      meal: newMeal,
      // Keep meal top-level for backwards compatibility if needed
      ...newMeal,
      updatedAt: new Date().toISOString(),
    };

    await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

    return ApiResponse.success(
      { kitchenTable: updatedTable },
      "Dinner broadcasted successfully",
      StatusCodes.OK,
    );
  }

  static async toggleKitchenTableRsvp(
    householdId: string,
    userId: string,
    attending: boolean,
    note?: string,
  ) {
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

    const currentData = await HouseholdRepository.getKitchenTable(householdId);
    const meal =
      currentData?.meal || (currentData?.dishName ? currentData : null);

    if (!meal || meal.status !== "ACTIVE") {
      return ApiResponse.error(
        "No active dinner broadcast found",
        StatusCodes.NOT_FOUND,
      );
    }

    const user = await UserRepo.getUserById(userId);
    const userName = user?.name || "Roommate";

    const rsvps = Array.isArray(meal.rsvps) ? [...meal.rsvps] : [];
    const existingIndex = rsvps.findIndex((r: any) => r.userId === userId);
    const rsvpEntry = {
      userId,
      userName,
      attending: Boolean(attending),
      note: note || (attending ? "Attending" : "Can't make it"),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex >= 0) {
      rsvps[existingIndex] = rsvpEntry;
    } else {
      rsvps.push(rsvpEntry);
    }

    const updatedMeal = {
      ...meal,
      rsvps,
    };

    const updatedTable = currentData.activeMode
      ? {
          ...currentData,
          meal: updatedMeal,
          updatedAt: new Date().toISOString(),
        }
      : {
          ...updatedMeal,
          activeMode: "CHEF",
          meal: updatedMeal,
          updatedAt: new Date().toISOString(),
        };

    await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

    return ApiResponse.success(
      { kitchenTable: updatedTable },
      "RSVP updated successfully",
      StatusCodes.OK,
    );
  }

  static async acknowledgeNotice(householdId: string, userId: string) {
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

    const currentData = await HouseholdRepository.getKitchenTable(householdId);
    if (!currentData?.notice) {
      return ApiResponse.error(
        "No active house notice found",
        StatusCodes.NOT_FOUND,
      );
    }

    const user = await UserRepo.getUserById(userId);
    const userName = user?.name || "Roommate";

    const acks = Array.isArray(currentData.notice.acknowledgments)
      ? [...currentData.notice.acknowledgments]
      : [];

    const existingIndex = acks.findIndex((a: any) => a.userId === userId);
    if (existingIndex < 0) {
      acks.push({
        userId,
        userName,
        acknowledgedAt: new Date().toISOString(),
      });
    }

    const updatedTable = {
      ...currentData,
      notice: {
        ...currentData.notice,
        acknowledgments: acks,
      },
      updatedAt: new Date().toISOString(),
    };

    await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

    return ApiResponse.success(
      { kitchenTable: updatedTable },
      "Notice acknowledged",
      StatusCodes.OK,
    );
  }

  static async replyQna(householdId: string, userId: string, text: string) {
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

    if (!text || typeof text !== "string" || !text.trim()) {
      return ApiResponse.error(
        "Reply text is required",
        StatusCodes.BAD_REQUEST,
      );
    }

    const currentData = await HouseholdRepository.getKitchenTable(householdId);
    if (!currentData?.qna) {
      return ApiResponse.error(
        "No active question found",
        StatusCodes.NOT_FOUND,
      );
    }

    const user = await UserRepo.getUserById(userId);
    const userName = user?.name || "Roommate";

    const replies = Array.isArray(currentData.qna.replies)
      ? [...currentData.qna.replies]
      : [];

    replies.push({
      replyId: `rep_${Date.now()}`,
      userId,
      userName,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    });

    const updatedTable = {
      ...currentData,
      qna: {
        ...currentData.qna,
        replies,
      },
      updatedAt: new Date().toISOString(),
    };

    await HouseholdRepository.updateKitchenTable(householdId, updatedTable);

    return ApiResponse.success(
      { kitchenTable: updatedTable },
      "Reply posted successfully",
      StatusCodes.OK,
    );
  }
}
