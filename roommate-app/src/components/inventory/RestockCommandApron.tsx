import { AlertTriangle, CalendarClock, RefreshCw, Zap } from 'lucide-react';
import type { InventoryItem } from '@/types/inventoryTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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

  const lowItemNames =
    lowStockItems.length > 0
      ? lowStockItems
          .slice(0, 3)
          .map((item) => `${item.name} (${item.quantity} left)`)
          .join(', ') + (lowStockItems.length > 3 ? ` +${lowStockItems.length - 3} more` : '')
      : 'All common kitchen & domestic supplies well stocked';

  return (
    <section className="w-full">
      <Card className="rounded-2xl border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-4 sm:p-5 shadow-xs transition-all">
        {/* Top Split: Alert & Primary Sync Command */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-border/50">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                lowCount > 0
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              <AlertTriangle className="w-5 h-5 stroke-[2.2]" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-display font-bold text-sm sm:text-base text-foreground">
                  {lowCount > 0
                    ? `${lowCount} item${lowCount > 1 ? 's' : ''} running low or empty`
                    : 'Pantry inventory is healthy'}
                </span>
                {lowCount > 0 ? (
                  <Badge
                    variant="destructive"
                    className="text-[11px] font-extrabold uppercase tracking-wider h-5 px-2"
                  >
                    Restock needed
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-[11px] font-extrabold uppercase tracking-wider h-5 px-2 text-primary bg-primary/10 border-primary/20"
                  >
                    Optimal levels
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{lowItemNames}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 px-3 py-2 min-h-[44px] rounded-xl bg-card border border-border/60 text-foreground text-xs font-medium shadow-2xs">
              <CalendarClock className="w-4 h-4 text-primary shrink-0" />
              <span>
                Scheduled Run: <strong className="text-foreground font-semibold">Sarah Lin</strong>{' '}
                (Tomorrow, 6:00 PM)
              </span>
            </div>

            <Button
              type="button"
              onClick={onSyncAllToCart}
              disabled={isSyncing || lowCount === 0}
              className="min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-bold gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>1-Tap Sync to Cart</span>
            </Button>
          </div>
        </div>

        {/* Quick-Pick Staples Strip */}
        <div className="pt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          <span className="font-semibold text-muted-foreground uppercase text-[11px] shrink-0 mr-1 flex items-center gap-1 tracking-wider">
            <Zap className="w-3.5 h-3.5 text-primary fill-primary" /> Quick-Pick Staples:
          </span>

          {QUICK_PICK_STAPLES.map((staple) => (
            <Button
              key={staple.name}
              type="button"
              variant="outline"
              onClick={() => onQuickAddStaple(staple.name, 1, staple.unit)}
              className="shrink-0 min-h-[44px] px-3 rounded-xl bg-card hover:bg-muted/50 border-border/60 text-foreground font-medium text-xs gap-1.5 shadow-2xs"
            >
              <span>
                {staple.emoji} {staple.name}
              </span>
              <span className="text-muted-foreground font-normal">{staple.price}</span>
            </Button>
          ))}
        </div>
      </Card>
    </section>
  );
}
