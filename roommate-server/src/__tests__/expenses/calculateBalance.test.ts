import { describe, it, expect } from "vitest";
import calculateBalance, {
  calculateSettlements,
  BalanceEntry,
} from "@src/expenses/calculateBalance";
import ExpenseDto from "@src/common/dtos/ExpenseDto";
import { User } from "@generated/prisma";

describe("calculateBalance", () => {
  describe("Core functionality", () => {
    it("should handle single expense with splits", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 100,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 50,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find((b) => b.userId === "user1")?.balance).toBe(100);
      expect(balances.find((b) => b.userId === "user2")?.balance).toBe(-50);
    });

    it("should split expense equally when payer also owes share", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 100,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user1",
              shareAmount: 50,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 50,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find((b) => b.userId === "user1")?.balance).toBe(50);
      expect(balances.find((b) => b.userId === "user2")?.balance).toBe(-50);
    });

    it("should handle multiple expenses between same users", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 100,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 50,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
        {
          householdId: "house1",
          paidById: "user2",
          amount: 80,
          paidBy: {
            userId: "user2",
            name: "Bob",
            email: "bob@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp2",
              userId: "user1",
              shareAmount: 40,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(2);
      expect(balances.find((b) => b.userId === "user1")?.balance).toBe(60); // paid 100, owes 40
      expect(balances.find((b) => b.userId === "user2")?.balance).toBe(30); // paid 80, owes 50
    });

    it("should handle three-way expense splitting", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 300,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user1",
              shareAmount: 100,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 100,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user3",
              shareAmount: 100,
              user: {
                userId: "user3",
                name: "Charlie",
                email: "charlie@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(3);
      expect(balances.find((b) => b.userId === "user1")?.balance).toBe(200);
      expect(balances.find((b) => b.userId === "user2")?.balance).toBe(-100);
      expect(balances.find((b) => b.userId === "user3")?.balance).toBe(-100);
    });

    it("should handle unequal split amounts", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 100,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user1",
              shareAmount: 30,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 70,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances.find((b) => b.userId === "user1")?.balance).toBe(70);
      expect(balances.find((b) => b.userId === "user2")?.balance).toBe(-70);
    });

    it("should handle decimal amounts correctly", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 33.33,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user1",
              shareAmount: 16.67,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 16.66,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances.find((b) => b.userId === "user1")?.balance).toBeCloseTo(
        16.66,
        2,
      );
      expect(balances.find((b) => b.userId === "user2")?.balance).toBeCloseTo(
        -16.66,
        2,
      );
    });
  });

  describe("Edge cases", () => {
    it("should return empty array for empty expenses", () => {
      const balances = calculateBalance([]);
      expect(balances).toEqual([]);
    });

    it("should handle expense with no splits", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 100,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [],
        },
      ];

      const balances = calculateBalance(expenses);

      expect(balances).toHaveLength(1);
      expect(balances[0].balance).toBe(100);
    });
  });

  describe("Balance conservation (critical!)", () => {
    it("should ensure total balance always equals zero", () => {
      const expenses: ExpenseDto[] = [
        {
          householdId: "house1",
          paidById: "user1",
          amount: 1500,
          paidBy: {
            userId: "user1",
            name: "Alice",
            email: "alice@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp1",
              userId: "user1",
              shareAmount: 500,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user2",
              shareAmount: 500,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp1",
              userId: "user3",
              shareAmount: 500,
              user: {
                userId: "user3",
                name: "Charlie",
                email: "charlie@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
        {
          householdId: "house1",
          paidById: "user2",
          amount: 300,
          paidBy: {
            userId: "user2",
            name: "Bob",
            email: "bob@example.com",
            password: "hash",
          },
          splits: [
            {
              expenseId: "exp2",
              userId: "user1",
              shareAmount: 100,
              user: {
                userId: "user1",
                name: "Alice",
                email: "alice@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp2",
              userId: "user2",
              shareAmount: 100,
              user: {
                userId: "user2",
                name: "Bob",
                email: "bob@example.com",
                password: "hash",
              } as User,
            },
            {
              expenseId: "exp2",
              userId: "user3",
              shareAmount: 100,
              user: {
                userId: "user3",
                name: "Charlie",
                email: "charlie@example.com",
                password: "hash",
              } as User,
            },
          ],
        },
      ];

      const balances = calculateBalance(expenses);
      const totalBalance = balances.reduce((sum, b) => sum + b.balance, 0);

      // Critical: Money must be conserved (what's owed equals what's paid)
      expect(totalBalance).toBe(0);
    });
  });

  describe("calculateSettlements (Debt simplification algorithm)", () => {
    it("should return empty array for empty balances", () => {
      expect(calculateSettlements([])).toEqual([]);
    });

    it("should return empty array when all balances are zero", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 0 },
        { userId: "u2", name: "Bob", balance: 0 },
        { userId: "u3", name: "Charlie", balance: 0 },
      ];

      expect(calculateSettlements(balances)).toEqual([]);
    });

    it("should ignore micro-balances under 1 cent (<= 0.01 threshold)", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 0.005 },
        { userId: "u2", name: "Bob", balance: -0.005 },
      ];

      expect(calculateSettlements(balances)).toEqual([]);
    });

    it("should calculate simple 1-to-1 settlement correctly", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 50.0 },
        { userId: "u2", name: "Bob", balance: -50.0 },
      ];

      const settlements = calculateSettlements(balances);

      expect(settlements).toHaveLength(1);
      expect(settlements[0]).toEqual({
        fromUserId: "u2",
        fromName: "Bob",
        toUserId: "u1",
        toName: "Alice",
        amount: 50.0,
      });
    });

    it("should handle 1 creditor and multiple debtors", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 100.0 },
        { userId: "u2", name: "Bob", balance: -60.0 },
        { userId: "u3", name: "Charlie", balance: -40.0 },
      ];

      const settlements = calculateSettlements(balances);

      expect(settlements).toHaveLength(2);
      expect(settlements[0]).toEqual({
        fromUserId: "u2",
        fromName: "Bob",
        toUserId: "u1",
        toName: "Alice",
        amount: 60.0,
      });
      expect(settlements[1]).toEqual({
        fromUserId: "u3",
        fromName: "Charlie",
        toUserId: "u1",
        toName: "Alice",
        amount: 40.0,
      });
    });

    it("should handle 1 debtor and multiple creditors", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 70.0 },
        { userId: "u2", name: "Bob", balance: 30.0 },
        { userId: "u3", name: "Charlie", balance: -100.0 },
      ];

      const settlements = calculateSettlements(balances);

      expect(settlements).toHaveLength(2);
      expect(settlements[0]).toEqual({
        fromUserId: "u3",
        fromName: "Charlie",
        toUserId: "u1",
        toName: "Alice",
        amount: 70.0,
      });
      expect(settlements[1]).toEqual({
        fromUserId: "u3",
        fromName: "Charlie",
        toUserId: "u2",
        toName: "Bob",
        amount: 30.0,
      });
    });

    it("should simplify multi-debtor multi-creditor graph into minimal transactions", () => {
      // 4 roommates: Alice +70, Bob +30, Charlie -60, Dave -40
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 70.0 },
        { userId: "u2", name: "Bob", balance: 30.0 },
        { userId: "u3", name: "Charlie", balance: -60.0 },
        { userId: "u4", name: "Dave", balance: -40.0 },
      ];

      const settlements = calculateSettlements(balances);

      // Charlie (owes 60) pays Alice (owed 70): 60. Alice has 10 left.
      // Dave (owes 40) pays Alice (owed 10): 10. Alice is cleared, Dave has 30 left.
      // Dave (owes 30) pays Bob (owed 30): 30. Both cleared.
      expect(settlements).toHaveLength(3);

      const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0);
      expect(totalSettled).toBe(100.0);

      expect(settlements[0]).toEqual({
        fromUserId: "u3",
        fromName: "Charlie",
        toUserId: "u1",
        toName: "Alice",
        amount: 60.0,
      });
      expect(settlements[1]).toEqual({
        fromUserId: "u4",
        fromName: "Dave",
        toUserId: "u1",
        toName: "Alice",
        amount: 10.0,
      });
      expect(settlements[2]).toEqual({
        fromUserId: "u4",
        fromName: "Dave",
        toUserId: "u2",
        toName: "Bob",
        amount: 30.0,
      });
    });

    it("should round settlement amounts to 2 decimal places with fractional cents", () => {
      const balances: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 66.666666 },
        { userId: "u2", name: "Bob", balance: -33.333333 },
        { userId: "u3", name: "Charlie", balance: -33.333333 },
      ];

      const settlements = calculateSettlements(balances);

      settlements.forEach((s) => {
        expect(Number.isFinite(s.amount)).toBe(true);
        // Should not have more than 2 decimal places
        const decimalStr = s.amount.toString().split(".")[1] || "";
        expect(decimalStr.length).toBeLessThanOrEqual(2);
      });
    });

    it("should handle unbalanced input gracefully without hanging or infinite loop", () => {
      // Degraded case: only debtors (data inconsistency in DB)
      const onlyDebtors: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: -50.0 },
        { userId: "u2", name: "Bob", balance: -50.0 },
      ];

      expect(calculateSettlements(onlyDebtors)).toEqual([]);

      // Degraded case: only creditors
      const onlyCreditors: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 50.0 },
        { userId: "u2", name: "Bob", balance: 50.0 },
      ];

      expect(calculateSettlements(onlyCreditors)).toEqual([]);
    });

    it("should terminate cleanly when debtor amount is slightly less than creditor amount", () => {
      const unbalanced: BalanceEntry[] = [
        { userId: "u1", name: "Alice", balance: 100.0 },
        { userId: "u2", name: "Bob", balance: -80.0 },
      ];

      const settlements = calculateSettlements(unbalanced);

      expect(settlements).toHaveLength(1);
      expect(settlements[0]).toEqual({
        fromUserId: "u2",
        fromName: "Bob",
        toUserId: "u1",
        toName: "Alice",
        amount: 80.0,
      });
    });
  });
});
