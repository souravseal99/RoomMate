import { Router } from "express";
import userRoutes from "@src/users/user.routes";
import authRoutes from "@src/auth/auth.routes";
import householdRouter from "@src/households/household.routes";
import expenseRouter from "@src/expenses/expense.routes";
import choreRouter from "@src/chore/chore.routes";
import inventoryRouter from "@src/inventory/inventory.routes";
import shoppingCartRouter from "@src/shopping-cart/shoppingCart.routes";
import hosueholdMemberRouter from "@src/household-members/householdMember.routes";
import dashboardRouter from "@src/dashboard/dashboard.routes";
import prisma from "@common/utils/prisma";

//NOTE - common syntex for routes
// routes.use('/path', middleware, specificActionsOnThePath);

const routes = Router();

routes.get("/health", async (_request, response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return response.status(200).json({
      status: "healthy",
      database: "connected",
      dateTime: new Date(),
    });
  } catch (error) {
    console.error("Health check failed:", error);
    return response.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      dateTime: new Date(),
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

routes.use("/user", userRoutes);

routes.use("/auth", authRoutes);

routes.use("/household", householdRouter);

routes.use("/household-member", hosueholdMemberRouter);

routes.use("/household-member", hosueholdMemberRouter);

routes.use("/expense", expenseRouter);

routes.use("/chore", choreRouter);

routes.use("/inventory", inventoryRouter);

routes.use("/shopping-cart", shoppingCartRouter);

routes.use("/dashboard", dashboardRouter);

export default routes;
