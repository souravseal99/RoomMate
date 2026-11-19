import { Router, Request, Response } from "express";
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
import { devSeedLimiter } from "@common/middlewares/rateLimiter";

//NOTE - common syntex for routes
// routes.use('/path', middleware, specificActionsOnThePath);

const routes = Router();

// 1. Liveness Probe (Zero I/O, ultra-fast for platform orchestrators & pingers)
routes.get("/health", (_request, response) => {
  return response.status(200).json({
    status: "healthy",
    uptime: Math.round(process.uptime()),
    dateTime: new Date(),
  });
});

// 2. Readiness & Keep-Alive Warm-Up Probe (Executes DB query, keeps Render & DB warm)
const handleReadinessCheck = async (_request: Request, response: Response) => {
  const start = performance.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    const latencyMs = Math.round(performance.now() - start);

    return response.status(200).json({
      status: "ready",
      database: "connected",
      latencyMs,
      dateTime: new Date(),
    });
  } catch (error) {
    console.error("Readiness check failed:", error);
    const latencyMs = Math.round(performance.now() - start);
    const isProduction = process.env.NODE_ENV === "production";
    return response.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      latencyMs,
      dateTime: new Date(),
      ...(isProduction
        ? {}
        : { error: error instanceof Error ? error.message : "Unknown error" }),
    });
  }
};

routes.get("/health/ready", handleReadinessCheck);
routes.get("/ready", handleReadinessCheck);

routes.use("/user", userRoutes);

routes.use("/auth", authRoutes);

routes.use("/household", householdRouter);

routes.use("/household-member", hosueholdMemberRouter);

if (
  process.env.NODE_ENV === "development" &&
  process.env.ENABLE_DEV_SEED === "true"
) {
  routes.post("/dev/seed", devSeedLimiter, async (req, response) => {
    const secret = req.headers["x-dev-seed-secret"];
    const expectedSecret =
      process.env.DEV_SEED_SECRET || "dev-seed-local-only-token";

    if (!secret || secret !== expectedSecret) {
      return response.status(403).json({
        message: "Forbidden: Invalid or missing dev seed secret",
      });
    }

    const { exec } = await import("child_process");
    exec("npm run db:seed:idempotent", (error, stdout, stderr) => {
      if (error) {
        console.error("Dev seed execution failed:", error, stderr);
        return response.status(500).json({
          message: "Seeding failed",
        });
      }
      console.log("Dev seed output:", stdout);
      return response.status(200).json({
        message: "Database seeded successfully for development",
      });
    });
  });
}

routes.use("/expense", expenseRouter);

routes.use("/chore", choreRouter);

routes.use("/inventory", inventoryRouter);

routes.use("/shopping-cart", shoppingCartRouter);

routes.use("/dashboard", dashboardRouter);

export default routes;
