import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { DashboardRepo } from "@src/dashboard/dashboard.repo";
import { DashboardStatsType } from "@src/dashboard/types/DashboardStatsType";

export class DashboardService {
  static async getDashboardStats(userId: string) {
    try {
      const [householdCount, pendingChoresCount, monthlyExpenses] =
        await Promise.all([
          DashboardRepo.getHouseholdCount(userId),
          DashboardRepo.getPendingChoresCount(userId),
          DashboardRepo.getCurrentMonthExpenses(userId),
        ]);

      const dashboardStats: DashboardStatsType = {
        households: {
          label: "Active Households",
          value: householdCount,
        },
        chores: {
          label: "Pending Tasks",
          value: pendingChoresCount,
        },
        expenses: {
          label: "This Month",
          value: Math.round(monthlyExpenses * 100) / 100,
        },
      };

      return ApiResponse.success(
        dashboardStats,
        "Dashboard stats retrieved successfully",
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
