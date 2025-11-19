import { Router } from "express";
import { HouseholdController } from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdController.create
);

householdRouter.post(
  "/join/:inviteCode",
  ensureAuthenticated,
  HouseholdController.join
);

householdRouter.get(
  "/all",
  ensureAuthenticated,
  HouseholdController.getHouseholdsByUser
);

householdRouter.post(
  "/delete",
  ensureAuthenticated,
  HouseholdController.delete
);

export default householdRouter;
