import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@common/utils/ApiResponse";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { Role } from "@generated/prisma";

export interface AuthorizeHouseholdOptions {
  requireAdmin?: boolean;
}

export const authorizeHousehold = (options: AuthorizeHouseholdOptions = {}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.userId;
    if (!userId) {
      const { status, message } = ApiResponse.error(
        "Authentication required",
        StatusCodes.UNAUTHORIZED,
      );
      return res.status(status).json({ message });
    }

    const householdId =
      (req.params?.householdId as string) ||
      (req.body?.householdId as string) ||
      (req.query?.householdId as string);

    if (!householdId) {
      const { status, message } = ApiResponse.error(
        "Household ID is required",
        StatusCodes.BAD_REQUEST,
      );
      return res.status(status).json({ message });
    }

    try {
      const membership = await HouseholdMemberRepo.isExistingUser(
        userId,
        householdId,
      );

      if (!membership) {
        const { status, message } = ApiResponse.error(
          "You do not belong to this household",
          StatusCodes.FORBIDDEN,
        );
        return res.status(status).json({ message });
      }

      if (options.requireAdmin && membership.role !== Role.ADMIN) {
        const { status, message } = ApiResponse.error(
          "Admin privileges required for this household",
          StatusCodes.FORBIDDEN,
        );
        return res.status(status).json({ message });
      }

      req.householdMember = membership;
      return next();
    } catch (error) {
      const { status, message, data } = ApiResponse.error(
        "Failed to authorize household access",
        StatusCodes.INTERNAL_SERVER_ERROR,
        error,
      );
      return res.status(status).json({ message, error: data });
    }
  };
};

export default authorizeHousehold;
