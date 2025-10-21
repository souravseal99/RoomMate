import { Router } from "express";
import { HouseholdController } from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import { csrfProtection } from "@src/common/middlewares/csrfProtection";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  csrfProtection,
  HouseholdController.create
);

householdRouter.post(
  "/join/:inviteCode",
  ensureAuthenticated,
  csrfProtection,
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
  csrfProtection,
  HouseholdController.delete
);

export default householdRouter;
