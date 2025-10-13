import { Router } from "express";
import { DashboardController } from "@src/dashboard/dashboard.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const dashboardRouter = Router();

dashboardRouter.get(
  "/",
  ensureAuthenticated,
  DashboardController.getDashboardData
);

dashboardRouter.get(
  "/stats/:householdId",
  ensureAuthenticated,
  DashboardController.getDashboardStats
);

export default dashboardRouter;