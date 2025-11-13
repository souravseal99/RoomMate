import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseSplitRepo } from '@src/expense-split/expenseSplit.repo';
import prisma from '@src/common/utils/prisma';
import ExpenseSplitDto from '@src/common/dtos/ExpenseSplitDto';

vi.mock('@src/common/utils/prisma', () => ({
  default: {
    expenseSplit: {
      createMany: vi.fn(),
    },
  },
}));

describe('ExpenseSplitRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('bulkCreate', () => {
    it('should bulk create multiple expense splits', async () => {
      const splits: ExpenseSplitDto[] = [
        {
          expenseId: 'expense-123',
          userId: 'user-1',
          shareAmount: 33.33,
        },
        {
          expenseId: 'expense-123',
          userId: 'user-2',
          shareAmount: 33.33,
        },
        {
          expenseId: 'expense-123',
          userId: 'user-3',
          shareAmount: 33.34,
        },
      ];

      const mockResult = { count: 3 };

      vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue(mockResult);

      const result = await ExpenseSplitRepo.bulkCreate(splits);

      expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
        data: splits,
      });
      expect(result).toEqual(mockResult);
      expect(result.count).toBe(3);
    });

    it('should handle single split', async () => {
      const splits: ExpenseSplitDto[] = [
        {
          expenseId: 'expense-456',
          userId: 'user-1',
          shareAmount: 100.00,
        },
      ];

      const mockResult = { count: 1 };

      vi.mocked(prisma.expenseSplit.createMany).mockResolvedValue(mockResult);

      const result = await ExpenseSplitRepo.bulkCreate(splits);

      expect(prisma.expenseSplit.createMany).toHaveBeenCalledWith({
        data: splits,
      });
      expect(result.count).toBe(1);
    });
  });
});
