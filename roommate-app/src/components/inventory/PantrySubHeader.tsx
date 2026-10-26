import { Plus, ShoppingCart, Thermometer, Lock, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface PantrySubHeaderProps {
  householdName?: string;
  memberCount?: number;
  cartItemCount: number;
  onAddCustomItem: () => void;
  onScrollToCart?: () => void;
}

export function PantrySubHeader({
  householdName = 'NorthWing #4B',
  memberCount = 4,
  cartItemCount,
  onAddCustomItem,
  onScrollToCart,
}: PantrySubHeaderProps) {
  return (
    <section className="border-b border-border/60 bg-card/60 backdrop-blur-sm -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-5 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Column: Badges & Headings */}
        <div className="space-y-2">
          {/* Micro Domestic Vitals Chips */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 min-h-[26px] rounded-full bg-surface-container text-muted-foreground font-semibold text-[11px] uppercase tracking-wider border-border/40"
            >
              {householdName} · {memberCount} Flatmates
            </Badge>

            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 px-2.5 py-1 min-h-[26px] rounded-full bg-surface-container-low text-muted-foreground font-medium text-[11px] border-border/30"
            >
              <Thermometer className="w-3.5 h-3.5 text-primary" />
              <span>71°F</span>
            </Badge>
          </div>

          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 stroke-[2.2]" />
            </span>
            <span>Pantry &amp; Shared Shopping Cart</span>
          </h1>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
            Zero-mental-math shared pantry stock, 1-tap tactile steppers, and automated in-store
            grocery checklist for {householdName}.
          </p>
        </div>

        {/* Right Column: Tactile Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
          <Button
            type="button"
            variant="outline"
            onClick={onAddCustomItem}
            className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-xl border-border bg-card hover:bg-surface-container text-foreground font-semibold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-primary stroke-[2.5]" />
            <span>Add Custom Item</span>
          </Button>

          <Button
            type="button"
            onClick={onScrollToCart}
            className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Cart ({cartItemCount} items)</span>
          </Button>
        </div>
      </div>
    </section>
  );
}

export default PantrySubHeader;
