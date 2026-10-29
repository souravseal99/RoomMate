import { describe, it, expect, beforeEach, vi } from "vitest";
import { Request, Response, NextFunction } from "express";
import { Role } from "@generated/prisma";
import { StatusCodes } from "http-status-codes";

// Mock Prisma
vi.mock("@src/common/utils/prisma", () => ({
  default: {},
}));

// Mock Repositories
vi.mock("@src/household-members/householdMember.repo");
vi.mock("@src/households/household.repo");
vi.mock("@src/expenses/expense.repo");
vi.mock("@src/expense-split/expenseSplit.repo");
vi.mock("@src/chore/chore.repo");
vi.mock("@src/inventory/inventory.repo");
vi.mock("@src/shopping-cart/shoppingCart.repo");
vi.mock("@src/users/user.repo");

import { authorizeHousehold } from "@src/auth/middlewares/authorizeHousehold";
import { HouseholdController } from "@src/households/household.controller";
import { HouseholdRepository } from "@src/households/household.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { ExpenseController } from "@src/expenses/expense.controller";
import { ExpenseRepo } from "@src/expenses/expense.repo";
import { ChoreController } from "@src/chore/chore.controller";
import { ChoreRepo } from "@src/chore/chore.repo";
import { InventoryController } from "@src/inventory/inventory.controller";

type MockRequest = Partial<Request> & {
  user?: { userId: string; role?: string };
};

/**
 * Pipeline helper to simulate Express middleware -> controller execution
 */
async function runPipeline({
  middleware,
  controller,
  req,
}: {
  middleware?: (req: Request, res: Response, next: NextFunction) => Promise<any> | any;
  controller: (req: Request, res: Response) => Promise<any> | any;
  req: MockRequest;
}) {
  let statusCode = 200;
  let responseData: any = null;

  const res: Partial<Response> = {
    status: vi.fn().mockImplementation((code: number) => {
      statusCode = code;
      return res;
    }),
    json: vi.fn().mockImplementation((data: any) => {
      responseData = data;
      return res;
    }),
  };

  let nextCalled = false;
  const next: NextFunction = vi.fn().mockImplementation(() => {
    nextCalled = true;
  });

  if (middleware) {
    await middleware(req as Request, res as Response, next);
    if (!nextCalled) {
      return { status: statusCode, body: responseData };
    }
  }

  await controller(req as Request, res as Response);
  return { status: statusCode, body: responseData };
}

describe("End-to-End Multi-Tenant Authorization Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup Multi-Tenant Database Mock
    // Household 1: user-A (ADMIN), user-B (MEMBER)
    // Household 2: user-C (ADMIN), user-D (MEMBER)
    vi.mocked(HouseholdMemberRepo.isExistingUser).mockImplementation(
      async (userId: string, householdId: string) => {
        if (householdId === "h1") {
          if (userId === "user-A") {
            return {
              householdMemberId: "hm-A",
              userId: "user-A",
              householdId: "h1",
              role: Role.ADMIN,
            } as any;
          }
          if (userId === "user-B") {
            return {
              householdMemberId: "hm-B",
              userId: "user-B",
              householdId: "h1",
              role: Role.MEMBER,
            } as any;
          }
        }
        if (householdId === "h2") {
          if (userId === "user-C") {
            return {
              householdMemberId: "hm-C",
              userId: "user-C",
              householdId: "h2",
              role: Role.ADMIN,
            } as any;
          }
          if (userId === "user-D") {
            return {
              householdMemberId: "hm-D",
              userId: "user-D",
              householdId: "h2",
              role: Role.MEMBER,
            } as any;
          }
        }
        return null;
      },
    );

    vi.mocked(HouseholdMemberRepo.getByHouseholdId).mockImplementation(
      async (householdId: string) => {
        if (householdId === "h1") {
          return [
            {
              householdMemberId: "hm-A",
              userId: "user-A",
              householdId: "h1",
              role: Role.ADMIN,
              user: { userId: "user-A", name: "Alpha", email: "alpha@test.com" },
            },
            {
              householdMemberId: "hm-B",
              userId: "user-B",
              householdId: "h1",
              role: Role.MEMBER,
              user: { userId: "user-B", name: "Beta", email: "beta@test.com" },
            },
          ] as any;
        }
        if (householdId === "h2") {
          return [
            {
              householdMemberId: "hm-C",
              userId: "user-C",
              householdId: "h2",
              role: Role.ADMIN,
              user: { userId: "user-C", name: "Gamma", email: "gamma@test.com" },
            },
            {
              householdMemberId: "hm-D",
              userId: "user-D",
              householdId: "h2",
              role: Role.MEMBER,
              user: { userId: "user-D", name: "Delta", email: "delta@test.com" },
            },
          ] as any;
        }
        return [];
      },
    );
  });

  describe("INT-1: Cross-Household Administration Denial", () => {
    it("User Alpha (Admin of H1) cannot update settings of Household 2", async () => {
      const req: MockRequest = {
        user: { userId: "user-A" },
        body: { householdId: "h2", name: "Malicious Household Rename" },
        params: {},
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold({ requireAdmin: true }),
        controller: HouseholdController.update,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/do not belong to this household/i);
      expect(HouseholdRepository.update).not.toHaveBeenCalled();
    });
  });

  describe("INT-2: Non-Admin Privilege Escalation Denial", () => {
    it("User Beta (Member of H1) cannot delete Household 1", async () => {
      const req: MockRequest = {
        user: { userId: "user-B" },
        body: { householdId: "h1" },
        params: {},
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold({ requireAdmin: true }),
        controller: HouseholdController.delete,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/admin privileges required/i);
      expect(HouseholdRepository.delete).not.toHaveBeenCalled();
    });
  });

  describe("INT-3: Financial Non-Repudiation (Admin cannot delete member expense)", () => {
    it("User Alpha (Admin of H1) cannot delete User Beta's expense in H1", async () => {
      vi.mocked(ExpenseRepo.getExpenseByExpenseId).mockResolvedValue({
        expenseId: "exp-B1",
        paidById: "user-B",
        householdId: "h1",
        amount: 150,
      } as any);

      const req: MockRequest = {
        user: { userId: "user-A" },
        params: { expenseId: "exp-B1" },
        body: { householdId: "h1" },
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold(),
        controller: ExpenseController.delete,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/only modify or delete your own expenses/i);
      expect(ExpenseRepo.delete).not.toHaveBeenCalled();
    });
  });

  describe("INT-4: Payer Expense Deletion", () => {
    it("User Beta can delete their own expense in H1", async () => {
      vi.mocked(ExpenseRepo.getExpenseByExpenseId).mockResolvedValue({
        expenseId: "exp-B1",
        paidById: "user-B",
        householdId: "h1",
        amount: 150,
      } as any);

      vi.mocked(ExpenseRepo.delete).mockResolvedValue({
        expenseId: "exp-B1",
        paidById: "user-B",
      } as any);

      const req: MockRequest = {
        user: { userId: "user-B" },
        params: { expenseId: "exp-B1" },
        body: { householdId: "h1" },
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold(),
        controller: ExpenseController.delete,
        req,
      });

      expect(result.status).toBe(StatusCodes.ACCEPTED);
      expect(result.body.message).toMatch(/expense deleted/i);
      expect(ExpenseRepo.delete).toHaveBeenCalledWith("exp-B1");
    });
  });

  describe("INT-5: Cross-Household Chore Mutation Denial", () => {
    it("User Gamma (H2) cannot complete a chore in H1", async () => {
      vi.mocked(ChoreRepo.getChoreWithUser).mockResolvedValue({
        choreId: "chore-H1",
        householdId: "h1",
        title: "Take out trash",
        assignedToId: "user-B",
        completed: false,
      } as any);

      const req: MockRequest = {
        user: { userId: "user-C" },
        params: { choreId: "chore-H1" },
        body: {},
        query: {},
      };

      const result = await runPipeline({
        controller: ChoreController.completeChore,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/do not belong to this household/i);
      expect(ChoreRepo.update).not.toHaveBeenCalled();
    });
  });

  describe("INT-6: Cross-Household Settlement Recipient Denial", () => {
    it("User Alpha (H1) cannot create a settlement with User Delta (H2)", async () => {
      const req: MockRequest = {
        user: { userId: "user-A" },
        body: {
          householdId: "h1",
          fromUserId: "user-A",
          toUserId: "user-D", // User Delta belongs to H2, not H1
          amount: 50,
        },
        params: {},
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold(),
        controller: ExpenseController.createSettlement,
        req,
      });

      expect(result.status).toBe(StatusCodes.BAD_REQUEST);
      expect(result.body.message).toMatch(/both users must be members of the household/i);
    });
  });

  describe("INT-7: Settlement Debtor Identity Spoofing Denial (VULN-02)", () => {
    it("User Beta cannot settle debt claiming fromUserId is User Alpha", async () => {
      const req: MockRequest = {
        user: { userId: "user-B" },
        body: {
          householdId: "h1",
          fromUserId: "user-A", // Attempting to forge debt repayment from User Alpha
          toUserId: "user-B",
          amount: 100,
        },
        params: {},
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold(),
        controller: ExpenseController.createSettlement,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/only settle your own debts/i);
    });
  });

  describe("INT-8: Cross-Household Inventory Access Denial", () => {
    it("User Delta (H2) cannot fetch inventory items of H1", async () => {
      const req: MockRequest = {
        user: { userId: "user-D" },
        params: { householdId: "h1" },
        body: {},
        query: {},
      };

      const result = await runPipeline({
        middleware: authorizeHousehold(),
        controller: InventoryController.getItems,
        req,
      });

      expect(result.status).toBe(StatusCodes.FORBIDDEN);
      expect(result.body.message).toMatch(/do not belong to this household/i);
    });
  });
});
