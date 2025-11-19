import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useInventory from "@/hooks/useInventory";
import useHousehold from "@/hooks/useHousehold";
import { getStatusBadge, getItemEmoji } from "@/utils/inventoryUtils";
import { addLowStockToCart } from "@/api/shoppingCartApi";
import { dispatchRefreshShoppingCart } from "@/components/inventory/config";
import { toast } from "sonner";
import { useState } from "react";

export function BuySoonPopover() {
  const { inventoryItems } = useInventory();
  const { selectedHousehold } = useHousehold();
  const [isAdding, setIsAdding] = useState(false);
  
  const buySoonItems = inventoryItems?.filter(item => 
    item.quantity <= item.lowThreshold
  ) || [];

  const handleAddAllToCart = async () => {
    if (!selectedHousehold) {
      toast.error("Please select a household first");
      return;
    }

    setIsAdding(true);
    try {
      await addLowStockToCart(selectedHousehold.key);
      toast.success("Low stock items added to cart");
      dispatchRefreshShoppingCart();
    } catch (error) {
      toast.error("Failed to add items to cart");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative">
          Buy Soon
          {buySoonItems.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-semibold text-white">
              {buySoonItems.length}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Items to Buy Soon</h4>
            {buySoonItems.length > 0 && (
              <Button 
                size="sm" 
                onClick={handleAddAllToCart}
                disabled={isAdding}
              >
                {isAdding ? "Adding..." : "Add All to Cart"}
              </Button>
            )}
          </div>
          {buySoonItems.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No items need restocking
            </p>
          ) : (
            <div className="space-y-2">
              {buySoonItems.map((item) => (
                <div 
                  key={item.inventoryItemId} 
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{getItemEmoji(item.name)}</span>
                    <div>
                      <span className="text-sm font-medium">{item.name}</span>
                      <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
                    </div>
                  </div>
                  {getStatusBadge(item.quantity, item.lowThreshold)}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
