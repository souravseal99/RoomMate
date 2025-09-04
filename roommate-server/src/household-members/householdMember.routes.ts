import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import { HouseholdMemberController } from "@src/household-members/householdMember.controller";

const hosueholdMemberRouter = Router();

hosueholdMemberRouter.post(
  "/create",
  ensureAuthenticated,
  HouseholdMemberController.create
);

export default hosueholdMemberRouter;
