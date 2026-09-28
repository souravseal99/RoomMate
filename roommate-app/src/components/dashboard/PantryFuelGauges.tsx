import { Refrigerator, AlertTriangle, ShoppingBag, Loader2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import { toast } from 'sonner';

export function PantryFuelGauges() {
  const { activeHouseholdId } = useHousehold();
  const addLowStockMutation = useAddLowStockToCartMutation();

  const handleRestock = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId, {
      onSuccess: () => {
        toast.success('Oat milk & olive oil added to cart!', {
          icon: <ShoppingBag className="w-4 h-4 text-primary" />,
        });
      },
    });
  };

  return (
    <section
      aria-label="Shared Pantry Inventory & Restock"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
            <Refrigerator className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h3 className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Shared Pantry Inventory
          </h3>
        </div>
        <span className="text-[10px] font-semibold tracking-wider uppercase text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-md font-mono">
          2 Need Restock
        </span>
      </div>

      {/* Item Rows */}
      <div className="flex flex-col divide-y divide-border/60">
        <div className="py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span className="font-semibold text-xs text-foreground tracking-tight truncate">
              Barista Oat Milk (2 pk)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono font-bold text-primary text-xs">0.3L left</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-mono">
              Low
            </span>
          </div>
        </div>

        <div className="py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span className="font-semibold text-xs text-foreground tracking-tight truncate">
              Extra Virgin Olive Oil
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="font-mono font-bold text-primary text-xs">10% left</span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded font-mono">
              Low
            </span>
          </div>
        </div>
      </div>

      {/* Auto-Add Action Button */}
      <button
        type="button"
        onClick={handleRestock}
        disabled={addLowStockMutation.isPending}
        className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-surface-container border border-border hover:bg-surface-container-high text-foreground font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
      >
        {addLowStockMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
        ) : (
          <ShoppingBag className="w-4 h-4 text-primary" />
        )}
        <span>Added to Cart ✨ (2 items queued)</span>
      </button>
    </section>
  );
}

export default PantryFuelGauges;
