import { Leaf, Flame, User, Clock, ListFilter } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

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
      <Card className="xl:col-span-7 bg-card p-2 rounded-2xl border-border/70 shadow-xs flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <Button
          type="button"
          variant={activeFilter === 'all' ? 'default' : 'outline'}
          onClick={() => onFilterChange('all')}
          className={`px-4 min-h-[44px] shrink-0 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'all'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high border-transparent'
          }`}
        >
          <ListFilter className="w-3.5 h-3.5 shrink-0" />
          <span>All Chores ({allCount})</span>
        </Button>

        <Button
          type="button"
          variant={activeFilter === 'mine' ? 'default' : 'outline'}
          onClick={() => onFilterChange('mine')}
          className={`px-4 min-h-[44px] shrink-0 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'mine'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high border-transparent'
          }`}
        >
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>My Duties ({mineCount})</span>
        </Button>

        <Button
          type="button"
          variant={activeFilter === 'today' ? 'default' : 'outline'}
          onClick={() => onFilterChange('today')}
          className={`px-4 min-h-[44px] shrink-0 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'today'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high border-transparent'
          }`}
        >
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Due Today ({todayCount})</span>
        </Button>

        <Button
          type="button"
          variant={activeFilter === 'urgent' ? 'default' : 'outline'}
          onClick={() => onFilterChange('urgent')}
          className={`px-4 min-h-[44px] shrink-0 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'urgent'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'bg-surface-container text-muted-foreground hover:text-foreground hover:bg-surface-container-high border-transparent'
          }`}
        >
          <Flame
            className={`w-3.5 h-3.5 shrink-0 ${activeFilter === 'urgent' ? 'fill-primary-foreground' : 'text-primary'}`}
          />
          <span>High Priority ({urgentCount})</span>
        </Button>
      </Card>

      {/* Household Progress Ribbon (5 cols) */}
      <Card className="xl:col-span-5 bg-card px-4 py-3 rounded-2xl border-border/70 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Leaf className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex flex-col min-w-0 gap-0.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-display font-bold text-xs sm:text-sm text-foreground whitespace-nowrap">
                Household Completion: {harmonyScore}%
              </span>
              <Badge
                variant="outline"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold uppercase tracking-wide whitespace-nowrap shrink-0"
              >
                <Flame className="w-3 h-3 fill-primary text-primary" />
                Active Streak
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground truncate">
              {completedCount} of {totalCount} completed this cycle
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
      </Card>
    </section>
  );
}

export default HarmonyHealthMeter;
