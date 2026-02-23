import { Router } from "express";
import { ShoppingCartController } from "@src/shopping-cart/shoppingCart.controller";
import ensureAuthenticated from "@src/auth/middlewares/ensureAuthenticated";

const shoppingCartRouter = Router();

shoppingCartRouter.get(
  "/:householdId",
  ensureAuthenticated,
  ShoppingCartController.getCartItemsByHouseholdId
);

shoppingCartRouter.post(
  "/add",
  ensureAuthenticated,
  ShoppingCartController.create
);

shoppingCartRouter.post(
  "/add-low-stock/:householdId",
  ensureAuthenticated,
  ShoppingCartController.addLowStockItems
);

shoppingCartRouter.patch(
  "/:cartItemId",
  ensureAuthenticated,
  ShoppingCartController.update
);

shoppingCartRouter.delete(
  "/:cartItemId",
  ensureAuthenticated,
  ShoppingCartController.delete
);

export default shoppingCartRouter;