import { Request, Response } from "express";
import { ShoppingCartService } from "@src/shopping-cart/shoppingCart.service";
import CreateCartItemRequest from "@src/shopping-cart/types/CreateCartItemRequest";
import UpdateCartItemRequest from "@src/shopping-cart/types/UpdateCartItemRequest";

export class ShoppingCartController {
  static async create(request: Request, response: Response) {
    const { itemName, quantity, householdId } = request.body;

    const createCartItemRequest: CreateCartItemRequest = {
      itemName,
      quantity,
      householdId,
    };

    const { status, message, data } = await ShoppingCartService.create(createCartItemRequest);

    return response.status(status).json({
      message,
      data,
    });
  }

  static async getCartItemsByHouseholdId(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } = await ShoppingCartService.getCartItemsByHouseholdId(householdId);

    return response.status(status).json({
      message,
      data,
    });
  }

  static async update(request: Request, response: Response) {
    const { cartItemId } = request.params;
    const { quantity } = request.body;

    const updateCartItemRequest: UpdateCartItemRequest = { quantity };

    const { status, message, data } = await ShoppingCartService.update(cartItemId, updateCartItemRequest);

    return response.status(status).json({
      message,
      data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { cartItemId } = request.params;

    const { status, message, data } = await ShoppingCartService.delete(cartItemId);

    return response.status(status).json({
      message,
      data,
    });
  }

  static async addLowStockItems(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } = await ShoppingCartService.addLowStockItems(householdId);

    return response.status(status).json({
      message,
      data,
    });
  }
}