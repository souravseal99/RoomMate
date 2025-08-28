import { Router } from "express";
import { HouseholdController } from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdController.create
);

export default householdRouter;
