import {
  CheckSquare,
  Trash2,
  CheckCircle2,
  Package,
  Droplets,
  ShoppingCart,
  Wallet,
  ArrowRight,
  Send,
  Loader2,
  Award,
} from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useAddLowStockToCartMutation } from '@/hooks/queries/useShoppingCartQueries';
import { toast } from 'sonner';

interface OverviewVitalsTabProps {
  onNavigateTab: (tab: string) => void;
  onOpenSettleModal?: () => void;
}

export function OverviewVitalsTab({
  onNavigateTab,
  onOpenSettleModal,
}: OverviewVitalsTabProps) {
  const { activeHouseholdId } = useHousehold();
  const addLowStockMutation = useAddLowStockToCartMutation();

  const handleRemindAlex = () => {
    toast.success('Gentle reminder sent to Alex Chen for Recycling & Trash!', {
      icon: <Send className="w-4 h-4 text-primary" />,
    });
  };

  const handlePushCart = () => {
    if (!activeHouseholdId) return;
    addLowStockMutation.mutate(activeHouseholdId, {
      onSuccess: () => {
        toast.success('Pushed 2 low-stock pantry items to shared cart! 🛒');
      },
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full animate-in fade-in duration-200">
      {/* LEFT COLUMN: Operations, Chores & Pantry Sensors (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        {/* Weekly Chores Telemetry Card */}
        <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
                <CheckSquare className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground font-display leading-tight">
                  Duty Operations
                </h2>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Weekly rotation cadence (10 Total)
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase">
              Reset in 2d
            </span>
          </div>

          {/* Chore Progress Bar & Visual Gauge */}
          <div className="bg-surface-container rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground font-display">
                Weekly Completion
              </span>
              <span className="font-mono font-bold text-primary">8 / 10 (80%)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-surface-container-high overflow-hidden flex">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: '80%' }}
              />
            </div>
            <div className="flex justify-between items-center text-muted-foreground text-[10px] font-mono pt-1">
              <span>Minimum target: 70%</span>
              <span className="text-secondary font-bold flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-primary" /> Streak: 10 Days
              </span>
            </div>
          </div>

          {/* Up Next Duty Item */}
          <div className="bg-surface-container-low border border-border p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-full bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                <Trash2 className="w-4 h-4" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] font-mono font-bold text-primary uppercase tracking-wider">
                  Up Next Today • 8:00 PM
                </span>
                <span className="font-bold text-xs text-foreground truncate">
                  Alex Chen: Recycling &amp; Trash Tetris
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  Curbside bin placement by alleyway
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRemindAlex}
              className="px-3 py-1.5 min-h-[44px] rounded-full bg-surface-container hover:bg-secondary-container hover:text-secondary text-foreground font-semibold text-xs transition-all shrink-0 cursor-pointer active:scale-95"
            >
              Remind
            </button>
          </div>

          {/* Recently Stamped Reel */}
          <div className="flex flex-col gap-2 pt-1">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Recently Stamped
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-surface-container p-2.5 rounded-xl flex items-center gap-2 border border-border/60">
                <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs text-foreground truncate">
                    Stove Degreased
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    You • +15 Karma
                  </span>
                </div>
              </div>
              <div className="bg-surface-container p-2.5 rounded-xl flex items-center gap-2 border border-border/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div className="flex flex-col min-w-0">
                  <span className="font-semibold text-xs text-foreground truncate">
                    Brita Water Filter
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    Sarah • +10 Karma
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pantry & Critical Household Reserves */}
        <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                <Package className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground font-display leading-tight">
                  Pantry &amp; Supplies
                </h2>
                <p className="text-[11px] text-muted-foreground font-mono">
                  2 Critical items need replenishment
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-destructive/10 text-destructive font-mono text-[10px] font-bold uppercase">
              Low Reserves
            </span>
          </div>

          {/* Item 1: Oat Milk */}
          <div className="bg-surface-container rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">Barista Oat Milk (Oatly)</span>
              </div>
              <span className="font-mono font-bold text-destructive">0.3L Remaining</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-destructive h-full rounded-full" style={{ width: '15%' }} />
            </div>
            <div className="flex justify-between text-muted-foreground text-[10px] font-mono">
              <span>Threshold: 1.0L min reserve</span>
              <span>Restock flag set by Alex</span>
            </div>
          </div>

          {/* Item 2: Olive Oil */}
          <div className="bg-surface-container rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <Droplets className="w-4 h-4 text-primary" />
                <span className="font-semibold text-foreground">
                  Extra Virgin Olive Oil (Greek)
                </span>
              </div>
              <span className="font-mono font-bold text-destructive">10% Remaining</span>
            </div>
            <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
              <div className="bg-destructive h-full rounded-full" style={{ width: '10%' }} />
            </div>
            <div className="flex justify-between text-muted-foreground text-[10px] font-mono">
              <span>Threshold: 250ml needed</span>
              <span>Restock flag set by Leo</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePushCart}
            disabled={addLowStockMutation.isPending}
            className="w-full min-h-[44px] bg-primary text-primary-foreground hover:bg-primary/90 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim disabled:opacity-50"
          >
            {addLowStockMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
            <span>Push 2 Low Items to Shared Cart</span>
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Balance Snapshot, Parity & Communal Outlays (6 cols) */}
      <div className="lg:col-span-6 flex flex-col gap-6">
        <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-4 select-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-secondary-container text-secondary flex items-center justify-center">
                <Wallet className="w-4 h-4 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="font-bold text-sm text-foreground font-display leading-tight">
                  Fairness &amp; Ledger Snapshot
                </h2>
                <p className="text-[11px] text-muted-foreground font-mono">
                  Real-time domestic parity
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase">
              Oct 1 - Oct 31
            </span>
          </div>

          {/* Odometer Personal Balance Display */}
          <div className="bg-surface-container p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider">
                Your Personal Net Position
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-display font-extrabold text-2xl sm:text-3xl text-primary tracking-tight font-mono">
                  +$24.50
                </span>
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Net in Credit
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground mt-0.5">
                You have covered more communal bulk utilities this week.
              </span>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={onOpenSettleModal}
                className="bg-primary text-primary-foreground px-4 py-2 min-h-[44px] rounded-full font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all text-center cursor-pointer border-b-2 border-primary-fixed-dim"
              >
                Settle Up ($15.00)
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('tab-fairness')}
                className="bg-surface-container-high text-foreground hover:bg-surface-container px-4 py-2 min-h-[44px] rounded-full font-semibold text-xs transition-all text-center cursor-pointer active:scale-95 border border-border"
              >
                Request New Split
              </button>
            </div>
          </div>

          {/* Peer Ledger Mini Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-border flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Sarah Lin</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  +$39.50
                </span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                Sarah owes you for Bulk Wi-Fi &amp; Coffee
              </span>
              <span className="text-[9px] font-mono font-bold text-primary uppercase mt-1 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                Ping Reminder sent
              </span>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-border flex flex-col gap-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground">Alex Chen</span>
                <span className="font-mono font-bold text-destructive">-$15.00</span>
              </div>
              <span className="text-[11px] text-muted-foreground">
                You owe Alex for Trader Joe's run
              </span>
              <span className="text-[9px] font-mono font-bold text-warning uppercase mt-1 inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                Pending approval
              </span>
            </div>
          </div>

          {/* Shared Communal Spending Telemetry */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-foreground font-display">
                  Monthly Communal Outlay
                </span>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Equal target: $250.00 / tenant
                </p>
              </div>
              <span className="font-mono font-bold text-base text-foreground">$1,000.00</span>
            </div>

            {/* Tenant Progress Bars */}
            <div className="space-y-2 pt-1">
              {/* Sourav */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <span className="font-semibold text-foreground">Sourav (You)</span>
                    <span className="text-muted-foreground text-[10px]">• 3 chores</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">$420.00 (42%)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              {/* Alex Chen */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                    <span className="font-semibold text-foreground">Alex Chen</span>
                    <span className="text-muted-foreground text-[10px]">• 2 chores</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">$295.50 (29.5%)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '29.5%' }} />
                </div>
              </div>

              {/* Sarah Lin */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                    <span className="font-semibold text-foreground">Sarah Lin</span>
                    <span className="text-muted-foreground text-[10px]">• 2 chores</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">$180.00 (18%)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '18%' }} />
                </div>
              </div>

              {/* Leo Keller */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground" />
                    <span className="font-semibold text-foreground">Leo Keller</span>
                    <span className="text-muted-foreground text-[10px]">• 1 chore</span>
                  </div>
                  <span className="font-mono font-bold text-foreground">$104.50 (10.5%)</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div className="bg-muted-foreground h-full rounded-full" style={{ width: '10.5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 text-muted-foreground text-xs font-mono border-t border-border">
            <span>Cycle: Oct 1 - Oct 31</span>
            <button
              type="button"
              onClick={() => onNavigateTab('tab-fairness')}
              className="text-primary hover:underline font-bold inline-flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <span>Fairness Audit Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OverviewVitalsTab;
