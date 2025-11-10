import { describe, it, expect } from 'vitest';
import calculateBalance from '@src/expenses/calculateBalance';
import ExpenseDto from '@src/common/dtos/ExpenseDto';
import { User } from '@generated/prisma';

describe('calculateBalance', () => {
  describe('Core functionality', () => {
    it('should handle single expense with splits', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 100,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            {
              expenseId: 'exp1',
              userId: 'user2',
              shareAmount: 50,
              user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find(b => b.userId === 'user1')?.balance).toBe(100);
      expect(balances.find(b => b.userId === 'user2')?.balance).toBe(-50);
    });

    it('should split expense equally when payer also owes share', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 100,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user1', shareAmount: 50, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user2', shareAmount: 50, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find(b => b.userId === 'user1')?.balance).toBe(50);
      expect(balances.find(b => b.userId === 'user2')?.balance).toBe(-50);
    });

    it('should handle multiple expenses between same users', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 100,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user2', shareAmount: 50, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
          ],
        },
        {
          householdId: 'house1',
          paidById: 'user2',
          amount: 80,
          paidBy: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp2', userId: 'user1', shareAmount: 40, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find(b => b.userId === 'user1')?.balance).toBe(60); // paid 100, owes 40
      expect(balances.find(b => b.userId === 'user2')?.balance).toBe(30); // paid 80, owes 50
    });

    it('should handle three-way expense splitting', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 300,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user1', shareAmount: 100, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user2', shareAmount: 100, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user3', shareAmount: 100, user: { userId: 'user3', name: 'Charlie', email: 'charlie@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(3);
      expect(balances.find(b => b.userId === 'user1')?.balance).toBe(200);
      expect(balances.find(b => b.userId === 'user2')?.balance).toBe(-100);
      expect(balances.find(b => b.userId === 'user3')?.balance).toBe(-100);
    });

    it('should handle unequal split amounts', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 100,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user1', shareAmount: 30, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user2', shareAmount: 70, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances.find(b => b.userId === 'user1')?.balance).toBe(70);
      expect(balances.find(b => b.userId === 'user2')?.balance).toBe(-70);
    });

    it('should handle decimal amounts correctly', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 33.33,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user1', shareAmount: 16.67, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user2', shareAmount: 16.66, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances.find(b => b.userId === 'user1')?.balance).toBeCloseTo(16.66, 2);
      expect(balances.find(b => b.userId === 'user2')?.balance).toBeCloseTo(-16.66, 2);
    });
  });

  describe('Edge cases', () => {
    it('should return empty array for empty expenses', () => {
      const balances = calculateBalance([]);
      expect(balances).toEqual([]);
    });

    it('should handle expense with no splits', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 100,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(1);
      expect(balances[0].balance).toBe(100);
    });
  });

  describe('Balance conservation (critical!)', () => {
    it('should ensure total balance always equals zero', () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: 'house1',
          paidById: 'user1',
          amount: 1500,
          paidBy: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp1', userId: 'user1', shareAmount: 500, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user2', shareAmount: 500, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
            { expenseId: 'exp1', userId: 'user3', shareAmount: 500, user: { userId: 'user3', name: 'Charlie', email: 'charlie@example.com', password: 'hash' } as User },
          ],
        },
        {
          householdId: 'house1',
          paidById: 'user2',
          amount: 300,
          paidBy: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' },
          splits: [
            { expenseId: 'exp2', userId: 'user1', shareAmount: 100, user: { userId: 'user1', name: 'Alice', email: 'alice@example.com', password: 'hash' } as User },
            { expenseId: 'exp2', userId: 'user2', shareAmount: 100, user: { userId: 'user2', name: 'Bob', email: 'bob@example.com', password: 'hash' } as User },
            { expenseId: 'exp2', userId: 'user3', shareAmount: 100, user: { userId: 'user3', name: 'Charlie', email: 'charlie@example.com', password: 'hash' } as User },
          ],
        },
      ];

      const balances = calculateBalance(expenses);
      const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

      // Critical: Money must be conserved (what's owed equals what's paid)
      expect(totalBalance).toBe(0);
    });
  });
});
