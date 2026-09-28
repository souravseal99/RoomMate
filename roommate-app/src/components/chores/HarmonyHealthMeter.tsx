import { Leaf, Flame, Sparkles } from 'lucide-react';

export type ChoreFilterOption = 'all' | 'mine' | 'today' | 'urgent';

interface HarmonyHealthMeterProps {
  activeFilter: ChoreFilterOption;
  onFilterChange: (filter: ChoreFilterOption) => void;
  allCount: number;
  mineCount: number;
  todayCount: number;
  urgentCount: number;
  completedCount: number;
  totalCount: number;
}

export function HarmonyHealthMeter({
  activeFilter,
  onFilterChange,
  allCount,
  mineCount,
  todayCount,
  urgentCount,
  completedCount,
  totalCount,
}: HarmonyHealthMeterProps) {
  const harmonyScore = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  return (
    <section className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 select-none">
      {/* Filter Chips Pill Bar (7 cols) */}
      <div className="xl:col-span-7 bg-card p-2 rounded-2xl border border-border/70 shadow-xs flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onFilterChange('all')}
          className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
          }`}
        >
          All Chores ({allCount})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('mine')}
          className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'mine'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
          }`}
        >
          My Duties Only 👤 ({mineCount})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('today')}
          className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'today'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
          }`}
        >
          Due Today ⏰ ({todayCount})
        </button>

        <button
          type="button"
          onClick={() => onFilterChange('urgent')}
          className={`px-4 py-2 min-h-[44px] rounded-full text-xs font-semibold transition-all cursor-pointer ${
            activeFilter === 'urgent'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high'
          }`}
        >
          High Priority 🔥 ({urgentCount})
        </button>
      </div>

      {/* Apartment Harmony Ribbon (5 cols) */}
      <div className="xl:col-span-5 bg-card px-4 py-3 rounded-2xl border border-border/70 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex flex-col min-w-0 gap-0.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm text-foreground whitespace-nowrap">
                Apartment Harmony: {harmonyScore}%
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap shrink-0">
                <Flame className="w-3 h-3 fill-primary text-primary" />
                14-Day Streak
              </span>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              {completedCount} of {totalCount} done • Sunday auto-rota in 2 days
            </span>
          </div>
        </div>

        <div className="w-24 shrink-0 flex flex-col gap-1 items-end pl-2">
          <div className="w-full h-2 rounded-full bg-surface-container overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, harmonyScore))}%` }}
            />
          </div>
          <span className="text-[10px] text-primary font-bold whitespace-nowrap tracking-wider">
            {completedCount} / {totalCount} TASKS
          </span>
        </div>
      </div>
    </section>
  );
}
