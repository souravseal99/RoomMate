import { Request, Response } from "express";
import { DashboardService } from "@src/dashboard/dashboard.service";
import { getUserFromRequestBody } from "@src/common/utils/utils";

export class DashboardController {
  static async getStats(request: Request, response: Response) {
    const { userId } = getUserFromRequestBody(request);

    const { status, data, message } = await DashboardService.getDashboardStats(
      userId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
