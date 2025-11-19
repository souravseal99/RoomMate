import prisma from "@src/common/utils/prisma";
import CreateCartItemRequest from "@src/shopping-cart/types/CreateCartItemRequest";
import UpdateCartItemRequest from "@src/shopping-cart/types/UpdateCartItemRequest";

export class ShoppingCartRepo {
  static async create(createCartItemRequest: CreateCartItemRequest) {
    return await prisma.shoppingCart.create({
      data: {
        itemName: createCartItemRequest.itemName,
        quantity: createCartItemRequest.quantity,
        householdId: createCartItemRequest.householdId,
      },
    });
  }

  static async getCartItemsByHouseholdId(householdId: string) {
    return await prisma.shoppingCart.findMany({
      where: { householdId },
      orderBy: { createdAt: "desc" },
    });
  }

  static async update(cartItemId: string, updateCartItemRequest: UpdateCartItemRequest) {
    return await prisma.shoppingCart.update({
      where: { shoppingCartId: cartItemId },
      data: { quantity: updateCartItemRequest.quantity },
    });
  }

  static async delete(cartItemId: string) {
    return await prisma.shoppingCart.delete({
      where: { shoppingCartId: cartItemId },
    });
  }

  static async addLowStockItems(householdId: string) {
    const allItems = await prisma.inventoryItem.findMany({
      where: { householdId }
    });

    const lowStockItems = allItems.filter(item => item.quantity <= item.lowThreshold);

    const cartItems = lowStockItems.map(item => ({
      itemName: item.name,
      quantity: Math.max(1, item.lowThreshold - item.quantity),
      householdId,
    }));

    if (cartItems.length === 0) {
      return { count: 0 };
    }

    return await prisma.shoppingCart.createMany({
      data: cartItems,
      skipDuplicates: true,
    });
  }
}