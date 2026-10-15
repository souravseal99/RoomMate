import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import useInventory from '@/hooks/useInventory';
import useHousehold from '@/hooks/useHousehold';
import { getStatusBadge, getItemEmoji } from '@/utils/inventoryUtils';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import { toast } from 'sonner';

export function BuySoonPopover() {
  const { inventoryItems } = useInventory();
  const { selectedHousehold } = useHousehold();
  const addLowStockMutation = useAddLowStockToCartMutation();

  const buySoonItems = inventoryItems?.filter((item) => item.quantity <= item.lowThreshold) || [];

  const handleAddAllToCart = async () => {
    if (!selectedHousehold) {
      toast.error('Please select a household first');
      return;
    }

    try {
      await addLowStockMutation.mutateAsync(selectedHousehold.key);
    } catch (error) {
      console.error('Failed to add low stock items to cart:', error);
    }
  };

  const isAdding = addLowStockMutation.isPending;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="relative min-h-[44px] px-4 font-semibold">
          Buy Soon
          {buySoonItems.length > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 flex h-5 w-5 p-0 items-center justify-center rounded-full text-xs font-bold">
              {buySoonItems.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 bg-card border-border shadow-md">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-foreground">Items to Buy Soon</h4>
            {buySoonItems.length > 0 && (
              <Button size="sm" className="min-h-[44px] px-3 font-semibold text-xs" onClick={handleAddAllToCart} disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add All to Cart'}
              </Button>
            )}
          </div>
          {buySoonItems.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-4">No items need restocking</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {buySoonItems.map((item) => (
                <div
                  key={item.inventoryItemId}
                  className="flex items-center justify-between p-2.5 bg-muted/40 rounded-xl border border-border/50"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base shrink-0">{getItemEmoji(item.name)}</span>
                    <div className="min-w-0">
                      <span className="text-sm font-semibold text-foreground truncate block">{item.name}</span>
                      <div className="text-xs text-muted-foreground font-mono">Qty: {item.quantity}</div>
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
