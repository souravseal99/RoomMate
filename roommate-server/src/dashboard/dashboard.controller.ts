import { Request, Response } from "express";
import { getUserFromRequestBody } from "@common/utils/utils";
import { DashboardService } from "@src/dashboard/dashboard.service";

export class DashboardController {
    
    static async stats(request: Request, response: Response) {
        const { userId } = getUserFromRequestBody(request);

        const { status, data, message } = await DashboardService.getStats(
            userId
        );

        return response.status(status).json({
            message: message,
            data: data,
        });
    }
}