import { Router } from "express";
import { InventoryController } from "@src/inventory/inventory.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";

const inventoryRouter = Router();

inventoryRouter.get(
  "/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  InventoryController.getItems,
);

inventoryRouter.post(
  "/add",
  ensureAuthenticated,
  authorizeHousehold(),
  InventoryController.create,
);

inventoryRouter.patch(
  "/:itemId",
  ensureAuthenticated,
  InventoryController.update,
);

inventoryRouter.delete(
  "/:itemId",
  ensureAuthenticated,
  InventoryController.delete,
);

export default inventoryRouter;
