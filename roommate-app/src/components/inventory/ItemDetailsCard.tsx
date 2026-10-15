import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { InventoryItem } from '@/types/inventoryTypes';
import { dateFormatterUtc } from '@/utils/utils';
import { getStatusBadge, getItemEmoji } from '@/utils/inventoryUtils';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { useState } from 'react';

type ItemDetailsCardProps = {
  itemDetails: InventoryItem;
  householdId?: string;
  onAddToList?: (item: InventoryItem, quantity: number) => void;
};

export function ItemDetailsCard({ itemDetails, onAddToList }: ItemDetailsCardProps) {
  const [shoppingQuantity, setShoppingQuantity] = useState(1);

  const updateShoppingQuantity = (newQuantity: number) => {
    if (newQuantity < 0) return;
    setShoppingQuantity(newQuantity);
  };

  return (
    <Card className="group relative bg-card rounded-xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      {/* Header with emoji, name and status */}
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{getItemEmoji(itemDetails.name)}</span>
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground text-sm leading-tight truncate">
              {itemDetails.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground font-mono">Qty: {itemDetails.quantity}</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">
                {dateFormatterUtc(itemDetails.lastUpdated ?? new Date().toISOString())}
              </span>
            </div>
          </div>
        </div>
        {getStatusBadge(itemDetails.quantity, itemDetails.lowThreshold)}
      </div>

      {/* Inline quantity controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 bg-muted/40 p-1 rounded-xl border border-border/50">
          <Button
            size="icon"
            variant="outline"
            className="min-h-[44px] min-w-[44px] rounded-lg"
            disabled={shoppingQuantity === 0}
            onClick={() => updateShoppingQuantity(shoppingQuantity - 1)}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <span className="mx-2 text-sm font-bold min-w-[2ch] text-center font-mono text-foreground">
            {shoppingQuantity}
          </span>
          <Button
            size="icon"
            variant="outline"
            className="min-h-[44px] min-w-[44px] rounded-lg"
            disabled={false}
            onClick={() => updateShoppingQuantity(shoppingQuantity + 1)}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">Low: {itemDetails.lowThreshold}</div>
      </div>

      {/* Add to List button */}
      <Button
        className="w-full min-h-[44px] rounded-xl font-semibold gap-2"
        onClick={() => onAddToList?.(itemDetails, shoppingQuantity)}
        disabled={shoppingQuantity === 0}
      >
        <ShoppingCart className="h-4 w-4" />
        <span>Add to List ({shoppingQuantity})</span>
      </Button>
    </Card>
  );
}
