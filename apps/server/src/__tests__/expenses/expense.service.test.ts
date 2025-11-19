import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ExpenseService } from '@src/expenses/expense.service';
import { ExpenseRepo } from '@src/expenses/expense.repo';
import { HouseholdMemberRepo } from '@src/household-members/householdMember.repo';
import { ExpenseSplitService } from '@src/expense-split/expenseSplit.service';
import calculateBalance from '@src/expenses/calculateBalance';
import ExpenseDto from '@src/common/dtos/ExpenseDto';
import { Expense } from '@generated/prisma';
import { StatusCodes } from 'http-status-codes';

vi.mock('@src/expenses/expense.repo');
vi.mock('@src/household-members/householdMember.repo');
vi.mock('@src/expense-split/expenseSplit.service');
vi.mock('@src/expenses/calculateBalance');

describe('ExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create expense without splits (solo expense)', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-123',
        amount: 100.00,
        description: 'Groceries',
      };

      const mockExpense: Expense = {
        expenseId: 'expense-123',
        description: 'Groceries',
        amount: 100.00,
        householdId: 'household-123',
        paidById: 'user-123',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({} as any);
      vi.mocked(ExpenseRepo.create).mockResolvedValue(mockExpense);

      const result = await ExpenseService.create(expenseDto, []);

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith('user-123', 'household-123');
      expect(ExpenseRepo.create).toHaveBeenCalledWith(expenseDto);
      expect(ExpenseSplitService.bulkCreate).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        message: 'Expense added',
        data: mockExpense,
      });
    });

    it('should create expense with splits (shared expense)', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-1',
        amount: 150.00,
        description: 'Dinner',
      };

      const sharedWith = ['user-1', 'user-2', 'user-3'];

      const mockExpense: Expense = {
        expenseId: 'expense-456',
        description: 'Dinner',
        amount: 150.00,
        householdId: 'household-123',
        paidById: 'user-1',
        createdAt: new Date('2025-11-05'),
      };

      const mockSplits = [
        { expenseSplitId: 'split-1', expenseId: 'expense-456', userId: 'user-1', shareAmount: 50.00 },
        { expenseSplitId: 'split-2', expenseId: 'expense-456', userId: 'user-2', shareAmount: 50.00 },
        { expenseSplitId: 'split-3', expenseId: 'expense-456', userId: 'user-3', shareAmount: 50.00 },
      ];

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({} as any);
      vi.mocked(ExpenseRepo.create).mockResolvedValue(mockExpense);
      vi.mocked(ExpenseSplitService.bulkCreate).mockResolvedValue(mockSplits as any);

      const result = await ExpenseService.create(expenseDto, sharedWith);

      expect(ExpenseRepo.create).toHaveBeenCalledWith(expenseDto);
      expect(ExpenseSplitService.bulkCreate).toHaveBeenCalledWith([
        { expenseId: 'expense-456', userId: 'user-1', shareAmount: 50.00 },
        { expenseId: 'expense-456', userId: 'user-2', shareAmount: 50.00 },
        { expenseId: 'expense-456', userId: 'user-3', shareAmount: 50.00 },
      ]);
      expect(result).toMatchObject({
        status: StatusCodes.CREATED,
        message: 'Added Expense with Expense split',
        data: {
          createdExpense: mockExpense,
          createdSplits: mockSplits,
        },
      });
    });

    it('should calculate equal splits correctly', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-1',
        amount: 100.00,
        description: 'Utilities',
      };

      const sharedWith = ['user-1', 'user-2', 'user-3'];

      const mockExpense: Expense = {
        expenseId: 'expense-789',
        description: 'Utilities',
        amount: 100.00,
        householdId: 'household-123',
        paidById: 'user-1',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({} as any);
      vi.mocked(ExpenseRepo.create).mockResolvedValue(mockExpense);
      vi.mocked(ExpenseSplitService.bulkCreate).mockResolvedValue([] as any);

      await ExpenseService.create(expenseDto, sharedWith);

      const expectedShareAmount = 100.00 / 3; // 33.333...

      expect(ExpenseSplitService.bulkCreate).toHaveBeenCalledWith([
        { expenseId: 'expense-789', userId: 'user-1', shareAmount: expectedShareAmount },
        { expenseId: 'expense-789', userId: 'user-2', shareAmount: expectedShareAmount },
        { expenseId: 'expense-789', userId: 'user-3', shareAmount: expectedShareAmount },
      ]);
    });

    it('should reject when user not member of household', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-nonmember',
        amount: 50.00,
        description: 'Unauthorized expense',
      };

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ExpenseService.create(expenseDto, []);

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith('user-nonmember', 'household-123');
      expect(ExpenseRepo.create).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: 'User is not a member of the household',
      });
    });

    it('should handle expense creation error', async () => {
      const expenseDto: ExpenseDto = {
        householdId: 'household-123',
        paidById: 'user-123',
        amount: 75.00,
        description: 'Error expense',
      };

      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({} as any);
      vi.mocked(ExpenseRepo.create).mockRejectedValue(new Error('Database error'));

      const result = await ExpenseService.create(expenseDto, []);

      expect(ExpenseRepo.create).toHaveBeenCalledWith(expenseDto);
      expect(result).toMatchObject({
        status: StatusCodes.CONFLICT,
        message: 'Unable to add Expense',
      });
    });
  });

  describe('getExpensesByHousehold', () => {
    it('should get all expenses for household', async () => {
      const mockExpenses: Expense[] = [
        {
          expenseId: 'expense-1',
          description: 'Expense 1',
          amount: 100.00,
          householdId: 'household-123',
          paidById: 'user-1',
          createdAt: new Date('2025-11-05'),
        },
        {
          expenseId: 'expense-2',
          description: 'Expense 2',
          amount: 200.00,
          householdId: 'household-123',
          paidById: 'user-2',
          createdAt: new Date('2025-11-05'),
        },
      ];

      vi.mocked(ExpenseRepo.getExpensesByHouseholdId).mockResolvedValue(mockExpenses as any);

      const result = await ExpenseService.getExpensesByHousehold('household-123');

      expect(ExpenseRepo.getExpensesByHouseholdId).toHaveBeenCalledWith('household-123');
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: mockExpenses,
      });
    });
  });

  describe('delete', () => {
    it('should successfully delete expense', async () => {
      const mockExpense: Expense = {
        expenseId: 'expense-123',
        description: 'To Delete',
        amount: 50.00,
        householdId: 'household-123',
        paidById: 'user-123',
        createdAt: new Date('2025-11-05'),
      };

      vi.mocked(ExpenseRepo.getExpenseByExpenseId).mockResolvedValue(mockExpense as any);
      vi.mocked(ExpenseRepo.delete).mockResolvedValue(mockExpense);

      const result = await ExpenseService.delete('expense-123');

      expect(ExpenseRepo.getExpenseByExpenseId).toHaveBeenCalledWith('expense-123');
      expect(ExpenseRepo.delete).toHaveBeenCalledWith('expense-123');
      expect(result).toMatchObject({
        status: StatusCodes.ACCEPTED,
        message: 'Expense Deleted',
        data: mockExpense,
      });
    });

    it('should reject when expense not found', async () => {
      vi.mocked(ExpenseRepo.getExpenseByExpenseId).mockResolvedValue(null);

      const result = await ExpenseService.delete('expense-nonexistent');

      expect(ExpenseRepo.getExpenseByExpenseId).toHaveBeenCalledWith('expense-nonexistent');
      expect(ExpenseRepo.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: 'Expense Not found',
      });
    });
  });

  describe('getBalances', () => {
    it('should calculate balances for household', async () => {
      const mockExpensesWithSplits = [
        {
          expenseId: 'expense-1',
          amount: 100.00,
          paidById: 'user-1',
          householdId: 'household-123',
          splits: [
            { userId: 'user-1', shareAmount: 50.00 },
            { userId: 'user-2', shareAmount: 50.00 },
          ],
        },
      ];

      const mockBalances = [
        { userId: 'user-1', balance: 50.00 },
        { userId: 'user-2', balance: -50.00 },
      ];

      vi.mocked(ExpenseRepo.getExpensesWithSplits).mockResolvedValue(mockExpensesWithSplits as any);
      vi.mocked(calculateBalance).mockReturnValue(mockBalances as any);

      const result = await ExpenseService.getBalances('household-123');

      expect(ExpenseRepo.getExpensesWithSplits).toHaveBeenCalledWith('household-123');
      expect(calculateBalance).toHaveBeenCalledWith(mockExpensesWithSplits);
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        data: mockBalances,
      });
    });
  });
});
