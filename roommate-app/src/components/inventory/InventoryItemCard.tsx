import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
    <Card className="flex items-center justify-between p-3 bg-muted/40 rounded-xl hover:bg-muted/70 transition-colors w-full sm:w-72 border-border">
      <div className="flex items-center gap-2.5 min-w-0">
        <span className="text-xl shrink-0">{getItemEmoji(item.name)}</span>
        <div className="min-w-0">
          <span className="text-sm font-semibold text-foreground truncate block">{item.name}</span>
          <div className="text-xs text-muted-foreground font-mono">Qty: {item.quantity}</div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            onClick={() => updateQuantity(item.quantity - 1)}
            disabled={isUpdating || item.quantity <= 0}
            className="min-h-[44px] min-w-[44px] rounded-lg"
            aria-label={`Decrease ${item.name} quantity`}
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>

          <span className="text-sm font-bold min-w-[1.75rem] text-center font-mono">{item.quantity}</span>

          <Button
            size="icon"
            variant="outline"
            onClick={() => updateQuantity(item.quantity + 1)}
            disabled={isUpdating}
            className="min-h-[44px] min-w-[44px] rounded-lg"
            aria-label={`Increase ${item.name} quantity`}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        {getStatusBadge(item.quantity, item.lowThreshold)}
      </div>
    </Card>
  );
}
