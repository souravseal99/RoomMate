import { Router } from "express";
import userRoutes from "@src/users/user.routes";
import authRoutes from "@src/auth/auth.routes";
import householdRouter from "@src/households/household.routes";
import expenseRouter from "@src/expenses/expense.routes";
import choreRouter from "@src/chore/chore.routes";
import inventoryRouter from "@src/inventory/inventory.routes";
import hosueholdMemberRouter from "@src/household-members/householdMember.routes";
import dashboardRouter from "@src/dashboard/dashboard.routes";

//NOTE - common syntex for routes
// routes.use('/path', middleware, specificActionsOnThePath);

const routes = Router();

routes.get("/health", (_request, response) =>
  response.json({
    dateTime: new Date(),
  })
);

routes.use("/user", userRoutes);

routes.use("/auth", authRoutes);

routes.use("/household", householdRouter);

routes.use("/household-member", hosueholdMemberRouter);

routes.use("/expense", expenseRouter);

routes.use("/chore", choreRouter);

routes.use("/inventory", inventoryRouter);

routes.use("/dashboard", dashboardRouter);

export default routes;
