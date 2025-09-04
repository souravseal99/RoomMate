import { Request, Response } from "express";
import { InventoryService } from "@src/inventory/inventory.service";
import CreateItemRequest from "@src/inventory/types/CreateItemRequest";
import UpdateItemRequest from "@src/inventory/types/UpdateItemRequest";

export class InventoryController {
  static async create(request: Request, response: Response) {
    const { name, quantity, lowThreshold, householdId } = request.body;

    const createItemRequest: CreateItemRequest = {
      name,
      quantity,
      lowThreshold,
      householdId,
    };

    const { status, message, data } = await InventoryService.createItem(
      createItemRequest
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async getItems(request: Request, response: Response) {
    const { householdId } = request.params;

    const { status, message, data } = await InventoryService.getItems(
      householdId
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async update(request: Request, response: Response) {
    const { itemId } = request.params;
    const { name, quantity, lowThreshold } = request.body;

    const updateItemRequest: UpdateItemRequest = {
      name,
      quantity,
      lowThreshold,
    };

    const { status, message, data } = await InventoryService.update(
      itemId,
      updateItemRequest
    );

    return response.status(status).json({
      message: message,
      data: data,
    });
  }

  static async delete(request: Request, response: Response) {
    const { itemId } = request.params;

    const { status, message, data } = await InventoryService.delete(itemId);

    return response.status(status).json({
      message: message,
      data: data,
    });
  }
}
