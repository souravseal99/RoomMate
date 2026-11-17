import { StatusCodes } from "http-status-codes";
import { User } from "@generated/prisma";
import { ApiResponse } from "@common/utils/ApiResponse";
import sanitizeUser from "@common/utils/sanitizeUser";
import { UserRepo } from "@src/users/user.repo";
import prisma from "@src/common/utils/prisma";

export class UserService {
  static async profile(userId: string) {
    const userRecord =
      (await UserRepo.getUserWithDetails(userId)) ||
      (await UserRepo.getUserById(userId));

    if (!userRecord)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND, {
        userId: userId,
      });

    let choresCompleted = 0;
    try {
      choresCompleted = await prisma.chore.count({
        where: { assignedToId: userId, completed: true },
      });
    } catch {
      choresCompleted = 0;
    }

    const rawHouseholds = (userRecord as any).households || [];
    const households = rawHouseholds.map((h: any) => ({
      householdId: h.householdId,
      name: h.household?.name || "Household",
      role: h.role,
      memberCount: h.household?._count?.members || 1,
      createdAt: h.household?.createdAt,
    }));

    const profileData = {
      ...sanitizeUser(userRecord),
      households,
      stats: {
        choresCompleted,
        spacesCount: households.length,
      },
    };

    return ApiResponse.success(profileData, `Hello ${userRecord.name}`);
  }

  static async updateProfile(userId: string, data: { name?: string }) {
    if (
      !data.name ||
      typeof data.name !== "string" ||
      data.name.trim().length < 2
    ) {
      return ApiResponse.error(
        "Name must be at least 2 characters long",
        StatusCodes.BAD_REQUEST,
      );
    }

    if (data.name.trim().length > 50) {
      return ApiResponse.error(
        "Name cannot exceed 50 characters",
        StatusCodes.BAD_REQUEST,
      );
    }

    try {
      const updated = await UserRepo.updateUser(userId, {
        name: data.name.trim(),
      });
      return ApiResponse.success(
        sanitizeUser(updated),
        "Profile updated successfully",
      );
    } catch (error) {
      return ApiResponse.error(
        "Failed to update profile",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async deleteAccount(userId: string) {
    try {
      const adminMemberships = await prisma.householdMember.findMany({
        where: { userId, role: "ADMIN" },
        include: {
          household: {
            include: {
              members: true,
            },
          },
        },
      });

      for (const m of adminMemberships) {
        const adminCount = m.household.members.filter(
          (mem) => mem.role === "ADMIN",
        ).length;
        if (adminCount === 1 && m.household.members.length > 1) {
          return ApiResponse.error(
            `Cannot delete account: You are the sole administrator of "${m.household.name}". Please transfer admin rights before deleting your account.`,
            StatusCodes.BAD_REQUEST,
          );
        }
      }

      await UserRepo.deleteUser(userId);
      return ApiResponse.success(null, "Account successfully deleted");
    } catch (error) {
      return ApiResponse.error(
        "Failed to delete account",
        StatusCodes.INTERNAL_SERVER_ERROR,
      );
    }
  }

  static async getUsers() {
    const userRecords: User[] | null = await UserRepo.getAllUsers();

    if (!userRecords)
      return ApiResponse.error("User not found", StatusCodes.NOT_FOUND);

    const sanitisedUsers = userRecords.map((user) => sanitizeUser(user));

    return ApiResponse.success(sanitisedUsers);
  }
}
