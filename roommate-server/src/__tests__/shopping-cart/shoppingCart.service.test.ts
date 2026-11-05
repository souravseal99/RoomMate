import { describe, it, expect, beforeEach, vi } from "vitest";
import { ShoppingCartService } from "@src/shopping-cart/shoppingCart.service";
import { ShoppingCartRepo } from "@src/shopping-cart/shoppingCart.repo";
import { HouseholdMemberRepo } from "@src/household-members/householdMember.repo";
import { StatusCodes } from "http-status-codes";

vi.mock("@src/shopping-cart/shoppingCart.repo");
vi.mock("@src/household-members/householdMember.repo");

describe("ShoppingCartService Authorization & Boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("update", () => {
    it("should reject when cart item not found", async () => {
      vi.mocked(ShoppingCartRepo.getById).mockResolvedValue(null);

      const result = await ShoppingCartService.update(
        "cart-nonexistent",
        { quantity: 2 },
        "user-1",
      );

      expect(result).toMatchObject({
        status: StatusCodes.NOT_FOUND,
        message: "Cart item not found",
      });
    });

    it("should reject with 403 when user does not belong to cart item's household", async () => {
      vi.mocked(ShoppingCartRepo.getById).mockResolvedValue({
        shoppingCartId: "cart-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ShoppingCartService.update(
        "cart-1",
        { quantity: 2 },
        "user-outsider",
      );

      expect(HouseholdMemberRepo.isExistingUser).toHaveBeenCalledWith(
        "user-outsider",
        "household-123",
      );
      expect(ShoppingCartRepo.update).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to cart item's household", async () => {
      vi.mocked(ShoppingCartRepo.getById).mockResolvedValue({
        shoppingCartId: "cart-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(ShoppingCartRepo.update).mockResolvedValue({
        shoppingCartId: "cart-1",
        quantity: 2,
      } as any);

      const result = await ShoppingCartService.update(
        "cart-1",
        { quantity: 2 },
        "user-member",
      );

      expect(ShoppingCartRepo.update).toHaveBeenCalledWith("cart-1", {
        quantity: 2,
      });
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Cart item updated",
      });
    });
  });

  describe("delete", () => {
    it("should reject with 403 when user does not belong to cart item's household", async () => {
      vi.mocked(ShoppingCartRepo.getById).mockResolvedValue({
        shoppingCartId: "cart-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue(null);

      const result = await ShoppingCartService.delete(
        "cart-1",
        "user-outsider",
      );

      expect(ShoppingCartRepo.delete).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: StatusCodes.FORBIDDEN,
        message: "You do not belong to this household",
      });
    });

    it("should succeed when user belongs to cart item's household", async () => {
      vi.mocked(ShoppingCartRepo.getById).mockResolvedValue({
        shoppingCartId: "cart-1",
        householdId: "household-123",
      } as any);
      vi.mocked(HouseholdMemberRepo.isExistingUser).mockResolvedValue({
        householdMemberId: "hm-1",
      } as any);
      vi.mocked(ShoppingCartRepo.delete).mockResolvedValue({} as any);

      const result = await ShoppingCartService.delete("cart-1", "user-member");

      expect(ShoppingCartRepo.delete).toHaveBeenCalledWith("cart-1");
      expect(result).toMatchObject({
        status: StatusCodes.OK,
        message: "Item removed from cart",
      });
    });
  });
});
