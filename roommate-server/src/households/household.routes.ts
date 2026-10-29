import { Router } from "express";
import { HouseholdController } from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdController.create,
);

householdRouter.post(
  "/join/:inviteCode",
  ensureAuthenticated,
  HouseholdController.join,
);

householdRouter.get(
  "/all",
  ensureAuthenticated,
  HouseholdController.getHouseholdsByUser,
);

householdRouter.post(
  "/delete",
  ensureAuthenticated,
  authorizeHousehold({ requireAdmin: true }),
  HouseholdController.delete,
);

householdRouter.post(
  "/update",
  ensureAuthenticated,
  authorizeHousehold({ requireAdmin: true }),
  HouseholdController.update,
);

export default householdRouter;
