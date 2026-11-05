import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";
import { ChoreController } from "@src/chore/chore.controller";

const choreRouter = Router();

choreRouter.post(
  "/add",
  ensureAuthenticated,
  authorizeHousehold(),
  ChoreController.add,
);
choreRouter.post(
  "/update/:choreId",
  ensureAuthenticated,
  ChoreController.completeChore,
);
choreRouter.get(
  "/household/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  ChoreController.getByHousehold,
);
choreRouter.delete("/:choreId", ensureAuthenticated, ChoreController.delete);

export default choreRouter;
