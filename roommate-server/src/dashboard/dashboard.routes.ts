import { Router } from "express";
import { DashboardController } from "@src/dashboard/dashboard.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const householdRouter = Router();

householdRouter.get(
    "/",
    ensureAuthenticated,
    DashboardController.stats
);

export default householdRouter;