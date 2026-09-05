import { Button } from '@/components/ui/button';
import { Minus, Plus } from 'lucide-react';
import { useUpdateInventoryMutation } from '@/hooks/queries/useInventoryQueries';
import useHousehold from '@/hooks/useHousehold';
import { getStatusBadge, getItemEmoji } from '@/utils/inventoryUtils';
import type { InventoryItem } from '@/types/inventoryTypes';

interface InventoryItemCardProps {
  item: InventoryItem;
  onUpdate?: () => void;
}

export function InventoryItemCard({ item, onUpdate }: InventoryItemCardProps) {
  const { selectedHousehold } = useHousehold();
  const updateMutation = useUpdateInventoryMutation();

  const updateQuantity = async (newQuantity: number) => {
    if (newQuantity < 0 || !item.inventoryItemId || !selectedHousehold) return;

    try {
      await updateMutation.mutateAsync({
        itemId: item.inventoryItemId,
        householdId: selectedHousehold.key,
        data: { quantity: newQuantity },
      });
      if (onUpdate) onUpdate();
    } catch {
      // Error handled by mutation
    }
  };

  const isUpdating = updateMutation.isPending && updateMutation.variables?.itemId === item.inventoryItemId;

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
            className="h-6 w-6 p-0 cursor-pointer"
          >
            <Minus className="h-3 w-3" />
          </Button>

          <span className="text-sm font-medium min-w-[2rem] text-center">{item.quantity}</span>

          <Button
            size="sm"
            variant="outline"
            onClick={() => updateQuantity(item.quantity + 1)}
            disabled={isUpdating}
            className="h-6 w-6 p-0 cursor-pointer"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {getStatusBadge(item.quantity, item.lowThreshold)}
      </div>
    </div>
  );
}
