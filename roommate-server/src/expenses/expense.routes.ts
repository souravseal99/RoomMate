import { Router } from "express";
import { ExpenseController } from "@src/expenses/expense.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const expenseRouter = Router();

// expenseRouter.get("/");
expenseRouter.post("/add", ensureAuthenticated, ExpenseController.create);

expenseRouter.get(
  "/for/:householdId",
  ensureAuthenticated,
  ExpenseController.getExpensesByHousehold
);

expenseRouter.delete(
  "/:expenseId",
  ensureAuthenticated,
  ExpenseController.delete
);

expenseRouter.get(
  "/for/:householdId/balances",
  ensureAuthenticated,
  ExpenseController.getBalances
);

// Settlement endpoints
expenseRouter.post(
  "/settlement",
  ensureAuthenticated,
  ExpenseController.createSettlement
);

expenseRouter.get(
  "/settlement/for/:householdId",
  ensureAuthenticated,
  ExpenseController.getSettlements
);

export default expenseRouter;
