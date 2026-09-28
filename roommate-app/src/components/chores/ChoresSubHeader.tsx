import { SlidersHorizontal, PlusCircle, CheckCircle2 } from 'lucide-react';

interface ChoresSubHeaderProps {
  cycleRange?: string;
  onOpenDutyCharter: () => void;
  onOpenAddChore: () => void;
}

export function ChoresSubHeader({
  cycleRange = 'Cycle Oct 21 – Oct 28',
  onOpenDutyCharter,
  onOpenAddChore,
}: ChoresSubHeaderProps) {
  return (
    <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 pb-1 select-none">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 min-h-[26px] rounded-full bg-primary/10 text-primary font-bold text-[11px] uppercase tracking-wider border border-primary/20">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Fair-Share Rota Active
          </span>
          <span className="text-xs text-muted-foreground font-medium">
            {cycleRange}
          </span>
        </div>

        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-foreground tracking-tight">
          Household Chores &amp; Daily Duties
        </h1>

        <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl">
          Glanceable whiteboard timeline • 1-tap checkoffs, zero-guilt filtering &amp; fair-share flatmate rota
        </p>
      </div>

      {/* Quick Action Buttons */}
      <div className="flex items-center gap-2.5 self-start lg:self-center shrink-0">
        <button
          type="button"
          onClick={onOpenDutyCharter}
          className="inline-flex items-center gap-2 px-4 py-2.5 min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs sm:text-sm border border-border/60 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>Duty Charter</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddChore}
          className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Toss a Chore</span>
        </button>
      </div>
    </section>
  );
}
