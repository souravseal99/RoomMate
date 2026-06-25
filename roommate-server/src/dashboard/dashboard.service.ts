import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { DashboardRepo } from "@src/dashboard/dashboard.repo";

export class DashboardService {
    static async getStats(userId: string) {
        try {
            const [householdCount, pendingChoresCount, expenses, activities] =
                await Promise.all([
                    DashboardRepo.getHouseholdCount(userId),
                    DashboardRepo.getPendingChoresCount(userId),
                    DashboardRepo.getExpenses(userId),
                    DashboardRepo.getRecentActivities(userId),
                ]);

            return ApiResponse.success(
                { householdCount, pendingChoresCount, expenses, ...activities },
                "Fetched dashboard stats successfully",
                StatusCodes.OK
            );
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            return ApiResponse.error(
                "Unable to fetch dashboard stats",
                StatusCodes.INTERNAL_SERVER_ERROR
            );
        }
    }
}
