import { describe, it, expect, beforeEach, vi } from "vitest";
import { ExpenseSplitService } from "@src/expense-split/expenseSplit.service";
import { ExpenseSplitRepo } from "@src/expense-split/expenseSplit.repo";
import ExpenseSplitDto from "@src/common/dtos/ExpenseSplitDto";

vi.mock("@src/expense-split/expenseSplit.repo");

describe("ExpenseSplitService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("bulkCreate", () => {
    it("should successfully delegate bulk create to ExpenseSplitRepo", async () => {
      const splits: ExpenseSplitDto[] = [
        {
          expenseId: "exp-1",
          userId: "user-1",
          shareAmount: 50.0,
        },
        {
          expenseId: "exp-1",
          userId: "user-2",
          shareAmount: 50.0,
        },
      ];

      const mockResult = { count: 2 };
      vi.mocked(ExpenseSplitRepo.bulkCreate).mockResolvedValue(
        mockResult as any,
      );

      const result = await ExpenseSplitService.bulkCreate(splits);

      expect(ExpenseSplitRepo.bulkCreate).toHaveBeenCalledWith(splits);
      expect(result).toEqual(mockResult);
    });

    it("should handle empty splits array", async () => {
      const mockResult = { count: 0 };
      vi.mocked(ExpenseSplitRepo.bulkCreate).mockResolvedValue(
        mockResult as any,
      );

      const result = await ExpenseSplitService.bulkCreate([]);

      expect(ExpenseSplitRepo.bulkCreate).toHaveBeenCalledWith([]);
      expect(result).toEqual(mockResult);
    });

    it("should propagate errors when repository fails", async () => {
      const splits: ExpenseSplitDto[] = [
        {
          expenseId: "exp-1",
          userId: "user-1",
          shareAmount: 25.0,
        },
      ];

      vi.mocked(ExpenseSplitRepo.bulkCreate).mockRejectedValue(
        new Error("Database transaction aborted"),
      );

      await expect(ExpenseSplitService.bulkCreate(splits)).rejects.toThrow(
        "Database transaction aborted",
      );
    });
  });
});
