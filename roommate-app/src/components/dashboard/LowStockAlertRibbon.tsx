import { AlertTriangle, ShoppingCart, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useHousehold from '@/hooks/useHousehold';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import type { InventoryItem } from '@/types/inventoryTypes';

interface LowStockAlertRibbonProps {
  lowStockItems?: InventoryItem[];
}

export function LowStockAlertRibbon({ lowStockItems = [] }: LowStockAlertRibbonProps) {
  const navigate = useNavigate();
  const { activeHouseholdId } = useHousehold();
  const addLowStockMutation = useAddLowStockToCartMutation();

  if (lowStockItems.length === 0) {
    return null;
  }

  const handleAutoAddToCart = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId);
  };

  const itemNames = lowStockItems.slice(0, 3).map((item) => item.name).join(', ');
  const remainingCount = lowStockItems.length - 3;
  const summaryText = remainingCount > 0 ? `${itemNames} +${remainingCount} more` : itemNames;

  return (
    <div className="w-full rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-xs select-none">
      <div className="flex items-start sm:items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
          <AlertTriangle className="w-5 h-5 animate-bounce" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-foreground">
              {lowStockItems.length} Low-Stock Pantry Item{lowStockItems.length > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              Needs Restock
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            Running out of: <span className="font-semibold text-foreground">{summaryText}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 shrink-0">
        <button
          type="button"
          onClick={handleAutoAddToCart}
          disabled={addLowStockMutation.isPending}
          className="w-full sm:w-auto px-4 py-2 min-h-[44px] rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-600 hover:bg-amber-700 active:scale-95 text-white flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer disabled:opacity-50"
        >
          {addLowStockMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <ShoppingCart className="w-4 h-4" />
          )}
          <span>Auto-Add to Cart</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/inventory')}
          className="px-3 py-2 min-h-[44px] rounded-xl font-semibold text-xs text-muted-foreground hover:text-foreground hover:bg-surface-container active:scale-95 transition-all flex items-center justify-center gap-1 cursor-pointer"
          title="Open Pantry Inventory"
        >
          <span>Pantry</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default LowStockAlertRibbon;
