import { Refrigerator, AlertTriangle, ShoppingBag, Loader2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useInventoryQuery } from '@/hooks/queries/useInventoryQueries';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export function PantryFuelGauges() {
  const { activeHouseholdId } = useHousehold();
  const { data: inventory = [] } = useInventoryQuery(activeHouseholdId);
  const addLowStockMutation = useAddLowStockToCartMutation();

  const lowStockItems = inventory.filter(
    (item) => item.quantity <= (item.lowThreshold || 3)
  );

  const displayItems: Array<{ id: string; name: string; remainingText: string }> =
    lowStockItems.length > 0
      ? lowStockItems.slice(0, 3).map((item) => ({
          id: item.inventoryItemId,
          name: item.name,
          remainingText: `${item.quantity} left`,
        }))
      : [
          { id: '1', name: 'Barista Oat Milk (2 pk)', remainingText: '0.3L left' },
          { id: '2', name: 'Extra Virgin Olive Oil', remainingText: '10% left' },
        ];

  const lowCount = lowStockItems.length > 0 ? lowStockItems.length : 2;

  const handleRestock = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId, {
      onSuccess: () => {
        toast.success(`${lowCount} pantry items added to shopping cart!`, {
          icon: <ShoppingBag className="w-4 h-4 text-primary" />,
        });
      },
    });
  };

  return (
    <Card
      aria-label="Shared Pantry Inventory & Restock"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4 select-none"
    >
      {/* Header */}
      <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-3 space-y-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
            <Refrigerator className="w-4 h-4 stroke-[2.2]" />
          </div>
          <CardTitle className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Shared Pantry Inventory
          </CardTitle>
        </div>
        <Badge
          variant="outline"
          className="text-[10px] font-semibold tracking-wider uppercase text-primary bg-primary/10 border-primary/20 px-2 py-0.5 rounded-md font-mono"
        >
          {lowCount} Need Restock
        </Badge>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Item Rows */}
        <div className="flex flex-col">
          {displayItems.map((item, idx) => (
            <div key={item.id}>
              <div className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
                  <span className="font-semibold text-xs text-foreground tracking-tight truncate">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono font-bold text-primary text-xs tabular-nums">
                    {item.remainingText}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border-primary/20 px-1.5 py-0.5 rounded font-mono"
                  >
                    Low
                  </Badge>
                </div>
              </div>
              {idx < displayItems.length - 1 && <Separator className="bg-border/60" />}
            </div>
          ))}
        </div>

        {/* Auto-Add Action Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleRestock}
          disabled={addLowStockMutation.isPending}
          className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-container border border-border hover:bg-surface-container-high text-foreground font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
        >
          {addLowStockMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <ShoppingBag className="w-4 h-4 text-primary" />
          )}
          <span>Added to Cart ✨ ({lowCount} items queued)</span>
        </Button>
      </CardContent>
    </Card>
  );
}

export default PantryFuelGauges;
