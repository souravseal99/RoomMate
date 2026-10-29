import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";
import { HouseholdMemberController } from "@src/household-members/householdMember.controller";

const hosueholdMemberRouter = Router();

hosueholdMemberRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdMemberController.create,
);

hosueholdMemberRouter.get(
  "/suggested",
  ensureAuthenticated,
  HouseholdMemberController.getSuggestedMembers,
);

hosueholdMemberRouter.get(
  "/all/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdMemberController.getAllHouseholdMembers,
);

hosueholdMemberRouter.post(
  "/leave/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  HouseholdMemberController.leave,
);

export default hosueholdMemberRouter;
