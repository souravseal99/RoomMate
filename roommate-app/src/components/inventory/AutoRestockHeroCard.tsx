import { ShoppingCart, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';

type Props = {
  householdId: string;
  lowStockCount: number;
  onNavigateToCart?: () => void;
};

export default function AutoRestockHeroCard({
  householdId,
  lowStockCount,
  onNavigateToCart,
}: Props) {
  const addLowStockMutation = useAddLowStockToCartMutation();

  const handleSyncToCart = async () => {
    try {
      await addLowStockMutation.mutateAsync(householdId);
      onNavigateToCart?.();
    } catch {
      // Error handled by mutation
    }
  };

  const isAllStocked = lowStockCount === 0;

  return (
    <div className="bg-primary text-primary-foreground rounded-2xl p-5 shadow-md border border-primary/20 flex flex-col justify-between space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-3">
        <div className="bg-primary-foreground/20 p-2.5 rounded-2xl backdrop-blur-xs flex items-center justify-center shrink-0">
          <ShoppingCart className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-base sm:text-lg font-extrabold tracking-tight flex items-center gap-1.5">
            Auto-Restock Assistant
            <Sparkles className="w-4 h-4 text-primary-foreground/80" />
          </h3>
          <p className="text-xs text-primary-foreground/80 mt-0.5">
            Intelligent low-stock monitoring &amp; procurement sync
          </p>
        </div>
      </div>

      {/* Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2">
          {isAllStocked ? (
            <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary-foreground">
              <CheckCircle2 className="w-4 h-4 text-emerald-300" />
              <span>All essentials are well-stocked</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-pulse shrink-0" />
              <p className="text-xs sm:text-sm font-extrabold text-primary-foreground">
                {lowStockCount} {lowStockCount === 1 ? 'item is' : 'items are'} running low
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleSyncToCart}
          disabled={addLowStockMutation.isPending || isAllStocked}
          className="bg-card hover:bg-card/90 text-foreground font-extrabold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer shrink-0 disabled:opacity-50"
        >
          {addLowStockMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Syncing...
            </>
          ) : isAllStocked ? (
            'Fully Stocked'
          ) : (
            'Sync to Cart'
          )}
        </Button>
      </div>
    </div>
  );
}
