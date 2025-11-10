import { Router } from "express";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import { ChoreController } from "@src/chore/chore.controller";

const choreRouter = Router();

choreRouter.post("/add", ensureAuthenticated, ChoreController.add);
choreRouter.post("/update/:choreId", ensureAuthenticated, ChoreController.completeChore);
choreRouter.get("/household/:householdId", ensureAuthenticated, ChoreController.getByHousehold);
choreRouter.delete("/:choreId", ensureAuthenticated, ChoreController.delete);

export default choreRouter;
