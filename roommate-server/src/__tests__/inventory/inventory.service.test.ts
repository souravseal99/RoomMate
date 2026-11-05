import { describe, it, expect, beforeEach, vi } from "vitest";
import { InventoryService } from "@src/inventory/inventory.service";
import { InventoryRepo } from "@src/inventory/inventory.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/inventory/inventory.repo");
vi.mock("@src/household-members/householdMember.repo");
vi.mock("@src/households/household.repo");

describe("InventoryService Authorization & Boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("update", () => {
    it("should reject when item not found", async () => {
      vi.mocked(InventoryRepo.getByItemId).mockResolvedValue(null);

      const result = await InventoryService.update(
        "item-nonexistent",
        { quantity: 5 },
        "user-1",
      );

      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "Item not found",
      });
    });

    it("should reject with 403 when user does not belong to the item's household", async () => {
      vi.mocked(InventoryRepo.getByItemId).mockResolvedValue({
        inventoryItemId: "item-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await InventoryService.update(
        "item-1",
        { quantity: 5 },
        "user-outsider",
      );

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
        "user-outsider",
        "household-123",
      );
      expect(InventoryRepo.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to the item's household", async () => {
      vi.mocked(InventoryRepo.getByItemId).mockResolvedValue({
        inventoryItemId: "item-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(InventoryRepo.update).mockResolvedValue({
        inventoryItemId: "item-1",
        quantity: 5,
      } as any);

      const result = await InventoryService.update(
        "item-1",
        { quantity: 5 },
        "user-member",
      );

      expect(InventoryRepo.update).toHaveBeenCalledWith("item-1", {
        quantity: 5,
      });
      expect(result).toMatchObject({
        status: StatusCodes.ACCEPTED,
        message: "Item Updated",
      });
    });
  });

  describe("delete", () => {
    it("should reject with 403 when user does not belong to the item's household", async () => {
      vi.mocked(InventoryRepo.getByItemId).mockResolvedValue({
        inventoryItemId: "item-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await InventoryService.delete("item-1", "user-outsider");

      expect(InventoryRepo.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to the item's household", async () => {
      vi.mocked(InventoryRepo.getByItemId).mockResolvedValue({
        inventoryItemId: "item-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(InventoryRepo.delete).mockResolvedValue({} as any);

      const result = await InventoryService.delete("item-1", "user-member");

      expect(InventoryRepo.delete).toHaveBeenCalledWith("item-1");
      expect(result).toMatchObject({
        status: StatusCodes.ACCEPTED,
        message: "Item deleted",
      });
    });
  });
});
