import { Router } from "express";
import householdController from "@src/households/household.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const householdRouter = Router();

householdRouter.post(
  "/create",
  ensureAuthenticated,
  householdController.create
);

export default householdRouter;
