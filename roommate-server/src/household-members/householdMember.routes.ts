import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import { HouseholdMemberController } from "@src/household-members/householdMember.controller";

const hosueholdMemberRouter = Router();

hosueholdMemberRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdMemberController.create
);

hosueholdMemberRouter.get(
  "/all/:householdId",
  ensureAuthenticated,
  HouseholdMemberController.getAllHouseholdMembers
);

export default hosueholdMemberRouter;
