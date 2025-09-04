import { StatusCodes } from "http-status-codes";
import { ApiResponse } from "@src/common/utils/ApiResponse";
import CreateItemRequest from "@src/inventory/types/CreateItemRequest";
import { InventoryRepo } from "@src/inventory/inventory.repo";
import UpdateItemRequest from "@src/inventory/types/UpdateItemRequest";
import { HouseholdRepository } from "@src/households/household.repo";

export class InventoryService {
  static async createItem(createItemRequest: CreateItemRequest) {
    const createdItem = await InventoryRepo.create(createItemRequest);
    return ApiResponse.success(
      createdItem,
      "Inventory Item created",
      StatusCodes.CREATED
    );
  }

  static async getItems(householdId: string) {
    const household = await HouseholdRepository.getHouseholdById(householdId);
    if (!household)
      return ApiResponse.error("Household not found", StatusCodes.NOT_FOUND);

    const items = await InventoryRepo.getByHouseholdId(householdId);

    return ApiResponse.success(items);
  }

  static async update(itemId: string, updateItemRequest: UpdateItemRequest) {
    const item = await InventoryRepo.getByItemId(itemId);
    if (!item)
      return ApiResponse.error("Item not found", StatusCodes.NOT_FOUND);

    const updatedItem = await InventoryRepo.update(itemId, updateItemRequest);

    return ApiResponse.success(
      updatedItem,
      "Item Updated",
      StatusCodes.ACCEPTED
    );
  }

  static async delete(itemId: string) {
    const item = await InventoryRepo.getByItemId(itemId);

    if (!item)
      return ApiResponse.error("Item not found", StatusCodes.NOT_FOUND);

    const deletedItem = await InventoryRepo.delete(itemId);

    return ApiResponse.success(deletedItem, "Item deleted", StatusCodes.GONE);
  }
}
