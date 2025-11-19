import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseRepo } from '@src/expenses/expense.repo';
import prisma from '@src/common/utils/prisma';
import ExpenseDto from '@src/common/dtos/ExpenseDto';

vi.mock('@src/common/utils/prisma', () => ({
  default: {
    expense: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
    expenseSplit: {
      deleteMany: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

describe('ExpenseRepo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create expense from DTO', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-123',
        amount: 150.50,
        description: 'Groceries',
      };

      const mockExpense = {
        expenseId: 'expense-123',
        description: 'Groceries',
        amount: 150.50,
        householdId: 'household-123',
        paidById: 'user-123',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(prisma.expense.create).mockResolvedValue(mockExpense);
      const result = await ExpenseRepo.create(expenseDto);
      expect(prisma.expense.create).toHaveBeenCalledWith({
        data: expenseDto,
      });
      expect(result).toEqual(mockExpense);
    });
  });

  describe('getExpensesByHouseholdId', () => {
    it('should get all expenses with paidBy user details', async () => {
      const mockExpenses = [
        {
          expenseId: 'expense-1',
          description: 'Groceries',
          amount: 100.00,
          householdId: 'household-123',
          paidById: 'user-1',
          createdAt: new Date('2025-11-05'),
          paidBy: {
            userId: 'user-1',
            name: 'Alice',
          },
        },
        {
          expenseId: 'expense-2',
          description: 'Utilities',
          amount: 200.00,
          householdId: 'household-123',
          paidById: 'user-2',
          createdAt: new Date('2025-11-05'),
          paidBy: {
            userId: 'user-2',
            name: 'Bob',
          },
        },
      ];

      vi.mocked(prisma.expense.findMany).mockResolvedValue(mockExpenses);
      const result = await ExpenseRepo.getExpensesByHouseholdId('household-123');
      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: { householdId: 'household-123' },
        include: {
          paidBy: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
      });
      expect(result).toHaveLength(2);
      expect(result[0].paidBy.name).toBe('Alice');
      expect(result[1].paidBy.name).toBe('Bob');
    });
  });

  describe('getExpenseByExpenseId', () => {
    it('should get single expense by ID or return null', async () => {
      const mockExpense = {
        expenseId: 'expense-123',
        description: 'Rent',
        amount: 1500.00,
        householdId: 'household-123',
        paidById: 'user-1',
        createdAt: new Date('2025-11-05'),
        paidBy: {
          userId: 'user-1',
          name: 'Alice',
        },
      };

      vi.mocked(prisma.expense.findUnique).mockResolvedValue(mockExpense);
      const result = await ExpenseRepo.getExpenseByExpenseId('expense-123');
      expect(prisma.expense.findUnique).toHaveBeenCalledWith({
        where: { expenseId: 'expense-123' },
        include: {
          paidBy: {
            select: {
              name: true,
              userId: true,
            },
          },
        },
      });
      expect(result).toEqual(mockExpense);
      vi.mocked(prisma.expense.findUnique).mockResolvedValue(null);
      const notFound = await ExpenseRepo.getExpenseByExpenseId('non-existent');
      expect(notFound).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete expense with splits in transaction', async () => {
      const expenseId = 'expense-123';
      const mockDeletedExpense = {
        expenseId,
        description: 'Deleted expense',
        amount: 100.00,
        householdId: 'household-123',
        paidById: 'user-1',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(prisma.$transaction).mockImplementation(async (callback: any) => {
        const tx = {
          expenseSplit: {
            deleteMany: vi.fn().mockResolvedValue({ count: 3 }),
          },
          expense: {
            delete: vi.fn().mockResolvedValue(mockDeletedExpense),
          },
        };
        return await callback(tx);
      });

      const result = await ExpenseRepo.delete(expenseId);

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeletedExpense);
    });

    it('should rollback transaction if deletion fails', async () => {
      const expenseId = 'expense-456';
      const error = new Error('Foreign key constraint failed');

      vi.mocked(prisma.$transaction).mockRejectedValue(error);

      await expect(ExpenseRepo.delete(expenseId)).rejects.toThrow(
        'Foreign key constraint failed'
      );

      expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExpensesWithSplits', () => {
    it('should get expenses with complete split and user details', async () => {
      const mockExpensesWithSplits = [
        {
          expenseId: 'expense-1',
          description: 'Groceries',
          amount: 100.00,
          householdId: 'household-123',
          paidById: 'user-1',
          createdAt: new Date('2025-11-05'),
          paidBy: {
            userId: 'user-1',
            name: 'Alice',
          },
          splits: [
            {
              expenseSplitId: 'split-1',
              expenseId: 'expense-1',
              userId: 'user-1',
              shareAmount: 50.00,
              user: {
                userId: 'user-1',
                name: 'Alice',
              },
            },
            {
              expenseSplitId: 'split-2',
              expenseId: 'expense-1',
              userId: 'user-2',
              shareAmount: 50.00,
              user: {
                userId: 'user-2',
                name: 'Bob',
              },
            },
          ],
        },
      ];

      vi.mocked(prisma.expense.findMany).mockResolvedValue(mockExpensesWithSplits);

      const result = await ExpenseRepo.getExpensesWithSplits('household-123');

      expect(prisma.expense.findMany).toHaveBeenCalledWith({
        where: { householdId: 'household-123' },
        include: {
          paidBy: {
            select: {
              userId: true,
              name: true,
            },
          },
          splits: {
            include: {
              user: {
                select: {
                  userId: true,
                  name: true,
                },
              },
            },
          },
        },
      });
      expect(result).toHaveLength(1);
      expect(result[0].paidBy.name).toBe('Alice');
      expect(result[0].splits).toHaveLength(2);
      expect(result[0].splits[0].user.name).toBe('Alice');
      expect(result[0].splits[1].user.name).toBe('Bob');
    });

    it('should return empty array when household has no expenses', async () => {
      vi.mocked(prisma.expense.findMany).mockResolvedValue([]);

      const result = await ExpenseRepo.getExpensesWithSplits('household-empty');

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });
});
