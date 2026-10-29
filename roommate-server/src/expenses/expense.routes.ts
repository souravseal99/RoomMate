import { Router } from "express";
import { ExpenseController } from "@src/expenses/expense.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";

const expenseRouter = Router();

expenseRouter.post(
  "/add",
  ensureAuthenticated,
  authorizeHousehold(),
  ExpenseController.create,
);

expenseRouter.get(
  "/for/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  ExpenseController.getExpensesByHousehold,
);

expenseRouter.delete(
  "/:expenseId",
  ensureAuthenticated,
  ExpenseController.delete,
);

expenseRouter.get(
  "/for/:householdId/balances",
  ensureAuthenticated,
  authorizeHousehold(),
  ExpenseController.getBalances,
);

// Settlement endpoints
expenseRouter.post(
  "/settlement",
  ensureAuthenticated,
  authorizeHousehold(),
  ExpenseController.createSettlement,
);

expenseRouter.get(
  "/settlement/for/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  ExpenseController.getSettlements,
);

export default expenseRouter;
