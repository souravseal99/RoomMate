import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";
import { updateInventoryItem } from "@/api/inventoryApi";
import { getStatusBadge, getItemEmoji } from "@/utils/inventoryUtils";
import { toast } from "sonner";
import type { InventoryItem } from "@/types/inventoryTypes";

interface InventoryItemCardProps {
  item: InventoryItem;
  onUpdate: () => void;
}

export function InventoryItemCard({ item, onUpdate }: InventoryItemCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0 || !item.id) return;
    
    setIsUpdating(true);
    try {
      // Use inventoryItemId if id is not available
      const itemId = item.id || (item as any).inventoryItemId;
      await updateInventoryItem(itemId, { quantity: newQuantity });
      onUpdate();
    } catch (error) {
      toast.error("Failed to update quantity");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors w-64">
      <div className="flex items-center gap-2">
        <span className="text-lg">{getItemEmoji(item.name)}</span>
        <div>
          <span className="text-sm font-medium">{item.name}</span>
          <div className="text-xs text-gray-500">Qty: {item.quantity}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateQuantity(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 0}
            className="h-6 w-6 p-0"
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="text-sm font-medium min-w-[2rem] text-center">
            {item.quantity}
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => updateQuantity(item.quantity + 1)}
            disabled={isUpdating}
            className="h-6 w-6 p-0"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        
        {getStatusBadge(item.quantity, item.lowThreshold)}
      </div>
    </div>
  );
}