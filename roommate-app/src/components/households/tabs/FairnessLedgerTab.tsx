import { Plus, Download, ShoppingBag, Wifi, Coffee, Scale, Zap, Package } from 'lucide-react';
import { toast } from 'sonner';

interface FairnessLedgerTabProps {
  onRecordBill?: () => void;
}

export function FairnessLedgerTab({ onRecordBill }: FairnessLedgerTabProps) {
  const handleExportCSV = () => {
    toast.success('Household ledger exported to CSV format! 📄');
  };

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-bold text-lg text-foreground font-display tracking-tight">
            Household Ledger &amp; Parity Telemetry
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automated balance resolution based on real rent, utilities, and daily shared staples.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onRecordBill || (() => toast.info('Recording shared bill flow opened'))}
            className="px-4 py-2 min-h-[44px] rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer border-b-2 border-primary-fixed-dim"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record Shared Bill</span>
          </button>
          <button
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs border border-border active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Parity Gauge Strip (3 Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1 */}
        <div className="bg-surface-container p-4 rounded-xl border border-border/80 flex flex-col">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-primary" />
            Communal Fairness Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-extrabold text-3xl text-primary font-mono">
              94%
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              Balanced
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Spend distribution matches chore distribution within an 8% variance window.
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container p-4 rounded-xl border border-border/80 flex flex-col">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-secondary" />
            Fixed Utilities Rollover
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-extrabold text-3xl text-foreground font-mono">
              $342.10
            </span>
            <span className="text-[11px] text-muted-foreground font-mono">Electric + Gas</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Automated split charged every 1st of month equally across 4 flatmates.
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container p-4 rounded-xl border border-border/80 flex flex-col">
          <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-tertiary" />
            Staples Micro-Fund
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="font-display font-extrabold text-3xl text-foreground font-mono">
              $78.40
            </span>
            <span className="text-xs font-bold text-secondary font-mono">Reserve Active</span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed">
            Used for coffee beans, detergent pods, trash bags, and cleaning supplies.
          </p>
        </div>
      </div>

      {/* Detailed Transaction Table */}
      <div className="flex flex-col gap-2 pt-2">
        <span className="font-bold text-xs text-foreground font-display">
          Recent Shared Ledger Entries
        </span>
        <div className="w-full bg-surface-container-low rounded-xl border border-border overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 bg-surface-container px-4 py-2.5 text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider border-b border-border">
            <div className="col-span-5 sm:col-span-4">Item &amp; Vendor</div>
            <div className="col-span-3 sm:col-span-3">Paid By</div>
            <div className="col-span-2 sm:col-span-3 text-right">Communal Cost</div>
            <div className="col-span-2 sm:col-span-2 text-right">Your Share</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-border/60">
            {/* Row 1 */}
            <div className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-surface-container/50 transition-colors">
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground truncate">
                    Trader Joe's Monthly Bulk
                  </span>
                  <span className="text-muted-foreground text-[10px] hidden sm:inline">
                    Produce, dish pods, oats
                  </span>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-3 text-foreground font-medium">Alex Chen</div>
              <div className="col-span-2 sm:col-span-3 text-right font-mono font-bold text-foreground">
                $128.40
              </div>
              <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-destructive">
                -$32.10
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-surface-container/50 transition-colors">
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-secondary-container text-secondary flex items-center justify-center shrink-0">
                  <Wifi className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground truncate">
                    Gigabit Fiber Internet
                  </span>
                  <span className="text-muted-foreground text-[10px] hidden sm:inline">
                    Sonic 1000Mbps Fiber
                  </span>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-3 text-foreground font-medium">
                Sourav (You)
              </div>
              <div className="col-span-2 sm:col-span-3 text-right font-mono font-bold text-foreground">
                $80.00
              </div>
              <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                +$60.00
              </div>
            </div>

            {/* Row 3 */}
            <div className="grid grid-cols-12 px-4 py-3 items-center text-xs hover:bg-surface-container/50 transition-colors">
              <div className="col-span-5 sm:col-span-4 flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-tertiary/20 text-tertiary flex items-center justify-center shrink-0">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-foreground truncate">
                    Counter Culture Espresso (5lb)
                  </span>
                  <span className="text-muted-foreground text-[10px] hidden sm:inline">
                    Common espresso supply
                  </span>
                </div>
              </div>
              <div className="col-span-3 sm:col-span-3 text-foreground font-medium">Sarah Lin</div>
              <div className="col-span-2 sm:col-span-3 text-right font-mono font-bold text-foreground">
                $64.00
              </div>
              <div className="col-span-2 sm:col-span-2 text-right font-mono font-bold text-destructive">
                -$16.00
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FairnessLedgerTab;
