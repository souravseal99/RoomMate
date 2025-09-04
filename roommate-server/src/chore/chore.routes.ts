import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import { ChoreController } from "@src/chore/chore.controller";

const choreRouter = Router();

choreRouter.post("/add", ensureAuthenticated, ChoreController.add);
choreRouter.post(
  "/update/:choreId",
  ensureAuthenticated,
  ChoreController.completeChore
);

export default choreRouter;
