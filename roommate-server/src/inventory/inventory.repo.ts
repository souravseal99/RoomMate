import prisma from "@src/common/utils/prisma";
import CreateItemRequest from "@src/inventory/types/CreateItemRequest";
import UpdateItemRequest from "@src/inventory/types/UpdateItemRequest";

export class InventoryRepo {
  static async getByItemId(inventoryItemId: string) {
    return await prisma.inventoryItem.findFirst({
      where: { inventoryItemId },
    });
  }

  static async getByHouseholdId(householdId: string) {
    return await prisma.inventoryItem.findMany({
      where: { householdId },
    });
  }

  static async create(createItemRequest: CreateItemRequest) {
    return await prisma.inventoryItem.create({
      data: createItemRequest,
    });
  }

  static async update(
    inventoryItemId: string,
    updateItemRequest: UpdateItemRequest
  ) {
    return await prisma.inventoryItem.update({
      where: { inventoryItemId },
      data: updateItemRequest,
    });
  }

  static async delete(itemId: string) {
    return await prisma.inventoryItem.delete({
      where: { inventoryItemId: itemId },
    });
  }
}
