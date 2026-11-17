import { describe, it, expect, beforeEach, vi } from "vitest";
import { DashboardRepo } from "@src/dashboard/dashboard.repo";
import prisma from "@src/common/utils/prisma";

vi.mock("@src/common/utils/prisma", () => ({
  default: {
    householdMember: {
      count: vi.fn(),
    },
    chore: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    expense: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

describe("DashboardRepo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getHouseholdCount", () => {
    it("should count household memberships for the given user", async () => {
      vi.mocked(prisma.householdMember.count).mockResolvedValue(3);

      const count = await DashboardRepo.getHouseholdCount("user-123");

      expect(count).toBe(3);
      expect(prisma.householdMember.count).toHaveBeenCalledWith({
        where: { userId: "user-123" },
      });
    });
  });

  describe("getPendingChoresCount", () => {
    it("should count all incomplete chores assigned to user without filtering out overdue chores", async () => {
      vi.mocked(prisma.chore.count).mockResolvedValue(5);

      const count = await DashboardRepo.getPendingChoresCount("user-123");

      expect(count).toBe(5);
      expect(prisma.chore.count).toHaveBeenCalledWith({
        where: {
          assignedToId: "user-123",
          completed: false,
        },
      });
    });
  });

  describe("getExpenses", () => {
    it("should aggregate total expenses paid by user", async () => {
      vi.mocked(prisma.expense.aggregate).mockResolvedValue({
        _sum: { amount: 350.75 },
      } as any);

      const total = await DashboardRepo.getExpenses("user-123");

      expect(total).toBe(350.75);
      expect(prisma.expense.aggregate).toHaveBeenCalledWith({
        where: { paidById: "user-123" },
        _sum: { amount: true },
      });
    });

    it("should return 0 when user has no expenses", async () => {
      vi.mocked(prisma.expense.aggregate).mockResolvedValue({
        _sum: { amount: null },
      } as any);

      const total = await DashboardRepo.getExpenses("user-new");

      expect(total).toBe(0);
    });
  });

  describe("getRecentActivities", () => {
    it("should map recent expenses and recent chores into activity summaries", async () => {
      const mockExpenses = [
        {
          expenseId: "exp-1",
          description: "Groceries",
          amount: 80,
          paidBy: { name: "Alice" },
          household: { name: "The Loft" },
          createdAt: new Date("2026-11-15"),
        },
      ];

      const mockChores = [
        {
          choreId: "chore-1",
          description: "Take out trash",
          completed: false,
          assignedTo: { name: "Bob" },
          household: { name: "The Loft" },
          nextDue: new Date("2026-11-18"),
        },
      ];

      vi.mocked(prisma.expense.findMany).mockResolvedValue(mockExpenses as any);
      vi.mocked(prisma.chore.findMany).mockResolvedValue(mockChores as any);

      const activities = await DashboardRepo.getRecentActivities("user-123");

      expect(activities.recentExpenses).toHaveLength(1);
      expect(activities.recentExpenses[0]).toEqual({
        id: "exp-1",
        type: "EXPENSE",
        title: "Groceries",
        amount: 80,
        paidBy: "Alice",
        household: "The Loft",
        date: mockExpenses[0].createdAt,
      });

      expect(activities.recentChores).toHaveLength(1);
      expect(activities.recentChores[0]).toEqual({
        id: "chore-1",
        type: "CHORE",
        title: "Take out trash",
        status: "PENDING",
        assignee: "Bob",
        household: "The Loft",
        dueDate: mockChores[0].nextDue,
      });
    });
  });
});
