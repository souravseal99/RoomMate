import { Router } from "express";
import { InventoryController } from "@src/inventory/inventory.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const inventoryRouter = Router();

inventoryRouter.get(
  "/:householdId",
  ensureAuthenticated,
  InventoryController.getItems
);

inventoryRouter.post("/add", ensureAuthenticated, InventoryController.create);

inventoryRouter.patch(
  "/:itemId",
  ensureAuthenticated,
  InventoryController.update
);

inventoryRouter.delete(
  "/:itemId",
  ensureAuthenticated,
  InventoryController.delete
);

export default inventoryRouter;
