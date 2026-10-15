import {
  Home,
  Calendar,
  Wallet,
  ClipboardList,
  Utensils,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ShoppingCart,
  Loader2,
} from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import type { InventoryItem } from '@/types/inventoryTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DashboardHeroCockpitProps {
  netBalance?: number;
  urgentChoreName?: string;
  lowStockItems?: InventoryItem[];
  peerDebtName?: string;
  peerDebtAmount?: number;
  peerDebtDescription?: string;
  onOpenSettleModal?: () => void;
}

export function DashboardHeroCockpit({
  netBalance = 24.5,
  urgentChoreName = 'Wipe Kitchen Quartz & Degrease Stove',
  lowStockItems = [],
  peerDebtName = 'Alex',
  peerDebtAmount = 15.0,
  peerDebtDescription = 'Whole Foods Haul',
  onOpenSettleModal,
}: DashboardHeroCockpitProps) {
  const { activeHousehold, activeHouseholdId, hasActiveHousehold } = useHousehold();
  const addLowStockMutation = useAddLowStockToCartMutation();

  const householdDisplayName = hasActiveHousehold && activeHousehold?.name
    ? activeHousehold.settings?.unitOrApt
      ? `${activeHousehold.name} • ${activeHousehold.settings.unitOrApt}`
      : activeHousehold.name
    : 'NorthWing #4B';

  const billingDay = activeHousehold?.settings?.billingCycleDay || 1;
  const currencyCode = activeHousehold?.settings?.currency || 'USD';

  const isNetPositive = netBalance >= 0;
  const formattedBalance = `${isNetPositive ? '+' : '-'}$${Math.abs(netBalance).toFixed(2)}`;

  const handleAutoAddToCart = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId);
  };

  const handleScrollToDuty = () => {
    const el = document.getElementById('duty-card-urgent');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Critical low stock items label
  const lowCount = lowStockItems.length > 0 ? lowStockItems.length : 2;
  const lowSummary =
    lowStockItems.length > 0
      ? lowStockItems.slice(0, 2).map((i) => `${i.name} (${i.quantity} left)`).join(', ')
      : 'Barista Oat Milk (0.3L), EVOO (10%)';

  return (
    <Card
      aria-label="Dominant Glanceable Hero Region"
      className="w-full bg-inset-cavity text-white rounded-2xl p-4 sm:p-5 lg:p-6 border-border/30 shadow-md flex flex-col gap-4 select-none relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

      {/* TOP CONTEXT BAR */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3 border-b border-white/10 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/15 flex items-center justify-center text-primary-fixed shrink-0">
            <Home className="w-4 h-4 text-primary" />
          </div>
          <h1 className="font-bold text-lg sm:text-xl text-white tracking-tight font-display">
            Today at {householdDisplayName}
          </h1>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] font-mono text-white/80 bg-black/40 border border-white/10 px-2.5 py-1 rounded-lg shrink-0">
          <Calendar className="w-3.5 h-3.5 text-primary-fixed" />
          <span>Auto-draft: Day {billingDay} • {currencyCode}</span>
        </div>
      </div>

      {/* VITALS GRID (3 CLEAN SHADCN CARDS) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* VITAL 1: FINANCIAL BALANCE */}
        <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
          <CardContent className="p-4 flex flex-col justify-between gap-3 h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/70 flex items-center gap-1.5 font-mono">
                  <Wallet className="w-3.5 h-3.5 text-primary-fixed" />
                  Your Balance
                </span>
                <Badge
                  variant={isNetPositive ? 'outline' : 'destructive'}
                  className={`text-[10px] font-bold uppercase tracking-wide font-mono ${
                    isNetPositive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-destructive/20 text-destructive border-destructive/30'
                  }`}
                >
                  {isNetPositive ? 'In Credit' : 'You Owe'}
                </Badge>
              </div>
              <div
                className={`font-mono font-bold text-2xl sm:text-3xl tracking-tight leading-none pt-1 tabular-nums ${
                  isNetPositive ? 'text-phosphor' : 'text-terracotta'
                }`}
              >
                {formattedBalance}
              </div>
              <p className="text-[11px] text-white/75 font-medium leading-snug mt-0.5 truncate">
                Owe {peerDebtName} ${peerDebtAmount.toFixed(2)} · {peerDebtDescription}
              </p>
            </div>

            <Button
              type="button"
              onClick={onOpenSettleModal}
              className="w-full min-h-[44px] py-2 px-3 rounded-lg bg-primary hover:bg-primary/90 active:scale-95 text-primary-foreground font-semibold text-xs tracking-tight transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer border-b-2 border-primary-fixed-dim"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Settle ${peerDebtAmount.toFixed(2)} with {peerDebtName}</span>
            </Button>
          </CardContent>
        </Card>

        {/* VITAL 2: URGENT DUTY */}
        <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
          <CardContent className="p-4 flex flex-col justify-between gap-3 h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/70 flex items-center gap-1.5 font-mono">
                  <ClipboardList className="w-3.5 h-3.5 text-terracotta" />
                  Communal Duty
                </span>
                <Badge
                  variant="destructive"
                  className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 animate-pulse font-mono"
                >
                  Urgent
                </Badge>
              </div>
              <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight mt-1 line-clamp-1">
                {urgentChoreName}
              </h2>
              <p className="text-[11px] text-white/80 flex items-center gap-1.5 leading-snug font-mono">
                <span className="text-terracotta">●</span>
                Due 7:00 PM · Main Kitchen
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleScrollToDuty}
              className="w-full min-h-[44px] py-2 px-3 rounded-lg bg-white/10 hover:bg-white/15 hover:text-white border-white/10 active:scale-95 text-white font-medium text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-primary-fixed" />
              <span>View &amp; Stamp Duty</span>
            </Button>
          </CardContent>
        </Card>

        {/* VITAL 3: DINNER GATHERING */}
        <Card className="bg-white/5 border-white/10 rounded-xl shadow-none">
          <CardContent className="p-4 flex flex-col justify-between gap-3 h-full">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/70 flex items-center gap-1.5 font-mono">
                  <Utensils className="w-3.5 h-3.5 text-primary-fixed" />
                  Dinner RSVP
                </span>
                <Badge
                  variant="secondary"
                  className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border-emerald-500/30 font-mono"
                >
                  Going ✨
                </Badge>
              </div>
              <h2 className="font-bold text-[13px] text-white leading-tight tracking-tight mt-1 line-clamp-1">
                Thai Curry with Jasmine Rice
              </h2>
              <p className="text-[11px] text-white/80 font-medium leading-snug flex items-center gap-1 font-mono">
                Tonight 8:00 PM · 3 RSVP'd
              </p>
            </div>

            <div className="flex items-center justify-between px-2.5 py-2 min-h-[44px] rounded-lg bg-black/30 border border-white/10 text-[11px] text-white/85">
              <span className="truncate">Chef: Sourav (3 extra portions)</span>
              <span className="text-primary-fixed font-semibold shrink-0 ml-1">Confirmed</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SLIM LOW-STOCK STRIP */}
      <div className="relative z-10 bg-amber-950/40 border border-warning/40 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-warning text-xs">
        <div className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="truncate text-white/90">
            <strong className="text-warning font-semibold">{lowCount} Critical Lows:</strong>{' '}
            {lowSummary}
          </span>
        </div>
        <Button
          type="button"
          onClick={handleAutoAddToCart}
          disabled={addLowStockMutation.isPending}
          className="min-h-[44px] sm:min-h-[36px] px-3 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 text-[11px] font-bold tracking-wide uppercase transition-colors shrink-0 flex items-center justify-center gap-1.5 self-start sm:self-auto shadow-xs cursor-pointer disabled:opacity-50"
        >
          {addLowStockMutation.isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ShoppingCart className="w-3.5 h-3.5" />
          )}
          <span>Auto-Add to Cart ({lowCount})</span>
        </Button>
      </div>
    </Card>
  );
}

export default DashboardHeroCockpit;
