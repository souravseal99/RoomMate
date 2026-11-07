import { Request, Response } from "express";
import { ActivityService } from "@src/activities/activity.service";
import { ApiResponse } from "@common/utils/ApiResponse";
import { StatusCodes } from "http-status-codes";

export class ActivityController {
  /**
   * GET /household/:householdId/activities
   */
  static async getFeed(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      const { status, message } = ApiResponse.error(
        "Authentication required",
        StatusCodes.UNAUTHORIZED,
      );
      return res.status(status).json({ message });
    }

    const householdId = Array.isArray(req.params.householdId)
      ? req.params.householdId[0]
      : req.params.householdId;
    if (!householdId) {
      const { status, message } = ApiResponse.error(
        "Household ID is required",
        StatusCodes.BAD_REQUEST,
      );
      return res.status(status).json({ message });
    }

    const filter = (req.query.filter as string) || "all";
    const { status, message, data } = await ActivityService.getFeed(
      householdId,
      userId,
      filter,
    );

    return res.status(status).json({ message, data });
  }

  /**
   * POST /household/:householdId/activities/:activityId/react
   */
  static async toggleReaction(req: Request, res: Response) {
    const userId = req.user?.userId;
    if (!userId) {
      const { status, message } = ApiResponse.error(
        "Authentication required",
        StatusCodes.UNAUTHORIZED,
      );
      return res.status(status).json({ message });
    }

    const householdId = Array.isArray(req.params.householdId)
      ? req.params.householdId[0]
      : req.params.householdId;
    const activityId = Array.isArray(req.params.activityId)
      ? req.params.activityId[0]
      : req.params.activityId;
    const { emoji } = req.body;

    if (!emoji || typeof emoji !== "string") {
      const { status, message } = ApiResponse.error(
        "Emoji is required",
        StatusCodes.BAD_REQUEST,
      );
      return res.status(status).json({ message });
    }

    const { status, message, data } = await ActivityService.toggleReaction(
      householdId,
      activityId,
      userId,
      emoji,
    );

    return res.status(status).json({ message, data });
  }
}
