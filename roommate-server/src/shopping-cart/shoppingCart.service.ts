import { ShoppingCartRepo } from "@src/shopping-cart/shoppingCart.repo";
import CreateCartItemRequest from "@src/shopping-cart/types/CreateCartItemRequest";
import UpdateCartItemRequest from "@src/shopping-cart/types/UpdateCartItemRequest";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import { StatusCodes } from "http-status-codes";

export class ShoppingCartService {
  static async create(createCartItemRequest: CreateCartItemRequest) {
    try {
      const cartItem = await ShoppingCartRepo.create(createCartItemRequest);
      return ApiResponse.success(cartItem, "Item added to cart", StatusCodes.CREATED);
    } catch (error) {
      return ApiResponse.error("Failed to add item to cart", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async getCartItemsByHouseholdId(householdId: string) {
    try {
      const cartItems = await ShoppingCartRepo.getCartItemsByHouseholdId(householdId);
      return ApiResponse.success(cartItems, "Cart items retrieved", StatusCodes.OK);
    } catch (error) {
      return ApiResponse.error("Failed to get cart items", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async update(cartItemId: string, updateCartItemRequest: UpdateCartItemRequest) {
    try {
      const cartItem = await ShoppingCartRepo.update(cartItemId, updateCartItemRequest);
      return ApiResponse.success(cartItem, "Cart item updated", StatusCodes.OK);
    } catch (error) {
      return ApiResponse.error("Failed to update cart item", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async delete(cartItemId: string) {
    try {
      await ShoppingCartRepo.delete(cartItemId);
      return ApiResponse.success(null, "Item removed from cart", StatusCodes.OK);
    } catch (error) {
      return ApiResponse.error("Failed to remove item from cart", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }

  static async addLowStockItems(householdId: string) {
    try {
      const result = await ShoppingCartRepo.addLowStockItems(householdId);
      return ApiResponse.success(result, "Low stock items added to cart", StatusCodes.CREATED);
    } catch (error) {
      return ApiResponse.error("Failed to add low stock items", StatusCodes.INTERNAL_SERVER_ERROR);
    }
  }
}