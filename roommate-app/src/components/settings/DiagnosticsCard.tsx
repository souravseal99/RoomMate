import { Activity, RefreshCw, BookOpen, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  onClearCache: () => void;
  onOpenCharter: () => void;
};

export default function DiagnosticsCard({
  onClearCache,
  onOpenCharter,
}: Props) {
  return (
    <section className="bg-card rounded-2xl border border-border p-5 sm:p-6 space-y-4 shadow-2xs">
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
          <Activity className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-foreground">Diagnostics &amp; Charter</h3>
          <p className="text-xs text-muted-foreground">
            System health indicators, shared living charter, and troubleshooting controls
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* System Health */}
        <div className="bg-surface-container/40 p-4 rounded-xl border border-border/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 className="text-xs font-extrabold text-foreground">API Server Connected</h4>
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Build version: <span className="font-mono font-bold text-foreground">v1.2.0-stable</span>
            </p>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            ~32ms latency
          </span>
        </div>

        {/* House Charter Trigger */}
        <div className="bg-surface-container/40 p-4 rounded-xl border border-border/60 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-extrabold text-foreground">House Rules &amp; Charter</h4>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Review communal quiet hours and etiquette
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onOpenCharter}
            className="text-xs font-bold rounded-xl gap-1.5 cursor-pointer bg-card hover:bg-surface-container shrink-0"
          >
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            View Charter
          </Button>
        </div>
      </div>

      {/* Cache purge */}
      <div className="pt-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-surface-container/20 p-3.5 rounded-xl border border-border/40">
        <div>
          <h5 className="text-xs font-bold text-foreground">Troubleshooting &amp; Refresh</h5>
          <p className="text-[11px] text-muted-foreground">
            Clear stale local cache and reload fresh data from the server
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onClearCache}
          className="text-xs font-extrabold rounded-xl gap-1.5 cursor-pointer hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Clear Cache &amp; Refresh
        </Button>
      </div>
    </section>
  );
}
