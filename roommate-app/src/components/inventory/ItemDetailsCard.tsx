import { Button } from "@/components/ui/button";
import type { InventoryItem } from "@/types/inventoryTypes";
import { dateFormatterUtc } from "@/utils/utils";
import { getStatusBadge, getItemEmoji } from "@/utils/inventoryUtils";
import { Minus, Plus, ShoppingCart } from "lucide-react";

import { useState, useEffect } from "react";
import useInventory from "@/hooks/useInventory";

type ItemDetailsCardProps = {
  itemDetails: InventoryItem;
  householdId?: string;
  onAddToList?: (item: InventoryItem, quantity: number) => void;
};

export function ItemDetailsCard({ itemDetails, householdId, onAddToList }: ItemDetailsCardProps) {
  const [shoppingQuantity, setShoppingQuantity] = useState(1);
  const [isUpdating, setIsUpdating] = useState(false);
  const { inventoryItems, setInventoryItems } = useInventory();

  const updateShoppingQuantity = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setShoppingQuantity(newQuantity);
  };



  return (
    <div className="group relative bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Header with emoji, name and status */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getItemEmoji(itemDetails.name)}</span>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm leading-tight">{itemDetails.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-500">Qty: {itemDetails.quantity}</span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-xs text-gray-500">{dateFormatterUtc(itemDetails.lastUpdated)}</span>
            </div>
          </div>
        </div>
        {getStatusBadge(itemDetails.quantity, itemDetails.lowThreshold)}
      </div>
      
      {/* Inline quantity controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 rounded-full"
            disabled={shoppingQuantity === 0}
            onClick={() => updateShoppingQuantity(shoppingQuantity - 1)}
          >
            <Minus className="h-3 w-3" />
          </Button>
          <span className="mx-2 text-sm font-medium min-w-[2ch] text-center">{shoppingQuantity}</span>
          <Button
            size="sm"
            variant="outline"
            className="h-7 w-7 p-0 rounded-full"
            disabled={false}
            onClick={() => updateShoppingQuantity(shoppingQuantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        <div className="text-xs text-gray-400">
          Low: {itemDetails.lowThreshold}
        </div>
      </div>
      
      {/* Add to List button */}
      <Button
        className="w-full"
        onClick={() => onAddToList?.(itemDetails, shoppingQuantity)}
        disabled={shoppingQuantity === 0}
      >
        <ShoppingCart className="h-4 w-4 mr-2" />
        Add to List ({shoppingQuantity})
      </Button>
    </div>
  );
}
