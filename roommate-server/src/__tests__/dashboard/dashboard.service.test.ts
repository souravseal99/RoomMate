import { describe, it, expect, beforeEach, vi } from "vitest";
import { DashboardService } from "@src/dashboard/dashboard.service";
import { DashboardRepo } from "@src/dashboard/dashboard.repo";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/dashboard/dashboard.repo");

describe("DashboardService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getStats", () => {
    it("should return aggregated stats on success", async () => {
      vi.mocked(DashboardRepo.getHouseholdCount).mockResolvedValue(2);
      vi.mocked(DashboardRepo.getPendingChoresCount).mockResolvedValue(4);
      vi.mocked(DashboardRepo.getExpenses).mockResolvedValue(125.5);
      vi.mocked(DashboardRepo.getRecentActivities).mockResolvedValue({
        recentExpenses: [{ id: "exp-1" } as any],
        recentChores: [{ id: "chore-1" } as any],
      });

      const response = await DashboardService.getStats("user-123");

      expect(response).toMatchObject({
        status: StatusCodes.OK,
        message: "Fetched dashboard stats successfully",
        data: {
          householdCount: 2,
          pendingChoresCount: 4,
          expenses: 125.5,
          recentExpenses: [{ id: "exp-1" }],
          recentChores: [{ id: "chore-1" }],
        },
      });
    });

    it("should return INTERNAL_SERVER_ERROR when repository query throws an error", async () => {
      vi.mocked(DashboardRepo.getHouseholdCount).mockRejectedValue(
        new Error("Database connection lost"),
      );

      const response = await DashboardService.getStats("user-123");

      expect(response).toMatchObject({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Unable to fetch dashboard stats",
      });
    });
  });
});
