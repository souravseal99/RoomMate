import { SlidersHorizontal, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        <Button
          type="button"
          variant="outline"
          onClick={onOpenDutyCharter}
          className="inline-flex items-center gap-2 px-4 min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs sm:text-sm border-border/60 transition-all cursor-pointer active:scale-95 shadow-xs"
        >
          <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
          <span>Duty Charter</span>
        </Button>

        <Button
          type="button"
          onClick={onOpenAddChore}
          className="inline-flex items-center gap-2 px-5 min-h-[44px] rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Toss a Chore</span>
        </Button>
      </div>
    </section>
  );
}

export default ChoresSubHeader;
