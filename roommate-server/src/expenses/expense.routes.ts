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

expenseRouter.get(
  "/for/:householdId/balances",
  ensureAuthenticated,
  ExpenseController.getBalances
);

export default expenseRouter;
