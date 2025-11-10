import { ShoppingCartRepo } from "@src/shopping-cart/shoppingCart.repo";
import CreateCartItemRequest from "@src/shopping-cart/types/CreateCartItemRequest";
import UpdateCartItemRequest from "@src/shopping-cart/types/UpdateCartItemRequest";
import { ApiResponse } from "@src/common/utils/ApiResponse";

export class ShoppingCartService {
  static async create(createCartItemRequest: CreateCartItemRequest) {
    try {
      const cartItem = await ShoppingCartRepo.create(createCartItemRequest);
      return ApiResponse.success(cartItem, "Item added to cart", 201);
    } catch (error) {
      return ApiResponse.error("Failed to add item to cart", 500);
    }
  }

  static async getByHousehold(householdId: string) {
    try {
      const cartItems = await ShoppingCartRepo.getByHousehold(householdId);
      return ApiResponse.success(cartItems, "Cart items retrieved", 200);
    } catch (error) {
      return ApiResponse.error("Failed to get cart items", 500);
    }
  }

  static async update(cartItemId: string, updateCartItemRequest: UpdateCartItemRequest) {
    try {
      const cartItem = await ShoppingCartRepo.update(cartItemId, updateCartItemRequest);
      return ApiResponse.success(cartItem, "Cart item updated", 200);
    } catch (error) {
      return ApiResponse.error("Failed to update cart item", 500);
    }
  }

  static async delete(cartItemId: string) {
    try {
      await ShoppingCartRepo.delete(cartItemId);
      return ApiResponse.success(null, "Item removed from cart", 200);
    } catch (error) {
      return ApiResponse.error("Failed to remove item from cart", 500);
    }
  }

  static async addLowStockItems(householdId: string) {
    try {
      const result = await ShoppingCartRepo.addLowStockItems(householdId);
      return ApiResponse.success(result, "Low stock items added to cart", 201);
    } catch (error) {
      return ApiResponse.error("Failed to add low stock items", 500);
    }
  }
}