import { RotateCw, ArrowRight, Trophy, Flame } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';

interface FlatmateScore {
  name: string;
  initials: string;
  avatarBg: string;
  completedText: string;
  karmaBadge: string;
  statusText: string;
  statusColor: string;
}

interface FridgeMagnetStandingsProps {
  currentUserName?: string;
  chores?: ChoreItem[];
  onOpenDutyCharter: () => void;
}

export function FridgeMagnetStandings({
  currentUserName = 'Sourav',
  chores = [],
  onOpenDutyCharter,
}: FridgeMagnetStandingsProps) {
  // Compute flatmate accomplishments from chores
  const myCompletedCount = chores.filter(
    (c) =>
      c.completed &&
      c.assignedToName &&
      (c.assignedToName.toLowerCase().includes('you') ||
        c.assignedToName.toLowerCase().includes(currentUserName.toLowerCase()))
  ).length;

  const roster: FlatmateScore[] = [
    {
      name: `${currentUserName} (You)`,
      initials: currentUserName.slice(0, 2).toUpperCase(),
      avatarBg: 'bg-primary text-primary-foreground',
      completedText: `${myCompletedCount > 0 ? myCompletedCount : 3} finished this cycle`,
      karmaBadge: `+${(myCompletedCount > 0 ? myCompletedCount : 3) * 5} Karma`,
      statusText: 'Completed',
      statusColor: 'text-primary font-bold',
    },
    {
      name: 'Sarah Lin',
      initials: 'SL',
      avatarBg: 'bg-secondary text-secondary-foreground',
      completedText: '2 covered • Coffee Station',
      karmaBadge: '1 Turn Left',
      statusText: 'On Track',
      statusColor: 'text-muted-foreground',
    },
    {
      name: 'Leo Keller',
      initials: 'LK',
      avatarBg: 'bg-surface-container text-foreground',
      completedText: '2 covered • Entryway',
      karmaBadge: 'All Set',
      statusText: 'Done',
      statusColor: 'text-emerald-600 dark:text-emerald-400 font-semibold',
    },
    {
      name: 'Alex Chen',
      initials: 'AC',
      avatarBg: 'bg-secondary text-secondary-foreground',
      completedText: 'Compost & Boxes',
      karmaBadge: 'Up Next',
      statusText: 'Tomorrow 7 AM',
      statusColor: 'text-destructive font-bold',
    },
  ];

  return (
    <div className="bg-card p-5 rounded-2xl border border-border/70 shadow-xs flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/50 pb-3">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Trophy className="w-4 h-4 stroke-[2.2]" />
          </span>
          <h2 className="font-display font-bold text-sm sm:text-base text-foreground">
            Fridge Magnet Standings
          </h2>
        </div>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 flex items-center gap-1">
          <Flame className="w-3 h-3 fill-primary text-primary" />
          14-DAY RECORD
        </span>
      </div>

      {/* Flatmate Roster Rows */}
      <div className="flex flex-col gap-2.5">
        {roster.map((flatmate) => (
          <div
            key={flatmate.name}
            className="flex items-center justify-between p-3 rounded-xl bg-surface-container-low/60 border border-border/40 hover:bg-surface-container-low transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${flatmate.avatarBg}`}
              >
                {flatmate.initials}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-display font-semibold text-xs sm:text-sm text-foreground truncate">
                  {flatmate.name}
                </span>
                <span className="text-[11px] text-muted-foreground truncate">
                  {flatmate.completedText}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end shrink-0 pl-2">
              <span className={`text-xs ${flatmate.statusColor}`}>
                {flatmate.karmaBadge}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {flatmate.statusText}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Sunday Auto-Rota Card */}
      <div className="p-4 rounded-xl bg-surface-container text-foreground flex flex-col gap-2 border border-border/50">
        <div className="flex items-center gap-2">
          <RotateCw className="w-4 h-4 text-primary shrink-0" />
          <span className="font-display font-bold text-xs sm:text-sm">
            Sunday Auto-Rota Switch
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Next weekly chore shuffle happens Sunday during coffee at 10:00 AM. Any unfinished tasks roll forward smoothly.
        </p>
        <button
          type="button"
          onClick={onOpenDutyCharter}
          className="text-xs text-primary font-bold hover:underline inline-flex items-center gap-1 self-start pt-1 cursor-pointer"
        >
          <span>View Household Chore Charter</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
