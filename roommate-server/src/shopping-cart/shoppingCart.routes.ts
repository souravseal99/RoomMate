import { Router } from "express";
import { ShoppingCartController } from "@src/shopping-cart/shoppingCart.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";
import authorizeHousehold from "@src/auth/middlewares/authorizeHousehold";

const shoppingCartRouter = Router();

shoppingCartRouter.get(
  "/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  ShoppingCartController.getCartItemsByHouseholdId,
);

shoppingCartRouter.post(
  "/add",
  ensureAuthenticated,
  authorizeHousehold(),
  ShoppingCartController.create,
);

shoppingCartRouter.post(
  "/add-low-stock/:householdId",
  ensureAuthenticated,
  authorizeHousehold(),
  ShoppingCartController.addLowStockItems,
);

shoppingCartRouter.patch(
  "/:cartItemId",
  ensureAuthenticated,
  ShoppingCartController.update,
);

shoppingCartRouter.delete(
  "/:cartItemId",
  ensureAuthenticated,
  ShoppingCartController.delete,
);

export default shoppingCartRouter;
