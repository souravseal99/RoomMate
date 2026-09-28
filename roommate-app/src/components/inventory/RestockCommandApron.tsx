import { AlertTriangle, CalendarClock, RefreshCw, Zap } from 'lucide-react';
import type { InventoryItem } from '@/types/inventoryTypes';

interface RestockCommandApronProps {
  lowStockItems: InventoryItem[];
  isSyncing?: boolean;
  onSyncAllToCart: () => void;
  onQuickAddStaple: (name: string, quantity: number, unit?: string) => void;
}

const QUICK_PICK_STAPLES = [
  { name: 'Barista Oat Milk', emoji: '🥛', price: '$3.89', unit: 'carton' },
  { name: 'Pasture Eggs', emoji: '🥚', price: '$4.50', unit: 'carton' },
  { name: 'Sourdough Bread', emoji: '🍞', price: '$4.20', unit: 'loaf' },
  { name: 'Coffee Beans', emoji: '☕', price: '$14.00', unit: 'bag' },
  { name: 'Paper Towels', emoji: '🧻', price: '$18.00', unit: 'pack' },
  { name: 'Dish Soap', emoji: '🧼', price: '$5.20', unit: 'bottle' },
];

export function RestockCommandApron({
  lowStockItems,
  isSyncing = false,
  onSyncAllToCart,
  onQuickAddStaple,
}: RestockCommandApronProps) {
  const lowCount = lowStockItems.length;

  const lowItemNames = lowStockItems.length > 0
    ? lowStockItems.slice(0, 3).map((item) => `${item.name} (${item.quantity} left)`).join(', ') +
      (lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : '')
    : 'All common kitchen & domestic supplies well stocked';

  return (
    <section className="w-full">
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-container-low to-card p-4 sm:p-5 shadow-xs transition-all">
        {/* Top Split: Alert & Primary Sync Command */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              lowCount > 0 ? 'bg-primary text-primary-foreground' : 'bg-surface-container text-muted-foreground'
            }`}>
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-sm sm:text-base text-foreground">
                  {lowCount > 0 ? `${lowCount} item${lowCount > 1 ? 's' : ''} running low or empty` : 'Pantry inventory is healthy'}
                </span>
                {lowCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive text-[11px] font-extrabold uppercase tracking-wider">
                    Restock needed
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-extrabold uppercase tracking-wider">
                    Optimal levels
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {lowItemNames}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-card border border-border/60 text-foreground text-xs font-medium shadow-2xs">
              <CalendarClock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Scheduled Run: <strong className="text-foreground font-semibold">Sarah Lin</strong> (Tomorrow, 6:00 PM)
              </span>
            </div>

            <button
              type="button"
              onClick={onSyncAllToCart}
              disabled={isSyncing || lowCount === 0}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>1-Tap Sync to Cart</span>
            </button>
          </div>
        </div>

        {/* Quick-Pick Staples Strip */}
        <div className="pt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-semibold text-muted-foreground uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1 tracking-wider">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" /> Quick-Pick Staples:
          </span>

          {QUICK_PICK_STAPLES.map((staple) => (
            <button
              key={staple.name}
              type="button"
              onClick={() => onQuickAddStaple(staple.name, 1, staple.unit)}
              className="shrink-0 px-3 py-2 min-h-[44px] rounded-xl bg-card hover:bg-surface-container border border-border/60 text-foreground font-medium text-xs transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95"
            >
              <span>{staple.emoji} {staple.name}</span>
              <span className="text-muted-foreground font-normal">{staple.price}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
