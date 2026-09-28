import { Clock, Bell } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';

interface OverdueUrgencyAlertProps {
  overdueChores: ChoreItem[];
  onSendNudge: (chore: ChoreItem) => void;
}

export function OverdueUrgencyAlert({
  overdueChores,
  onSendNudge,
}: OverdueUrgencyAlertProps) {
  if (overdueChores.length === 0) return null;

  const topOverdue = overdueChores[0];
  const assignee = topOverdue.assignedToName || 'Flatmate';

  return (
    <section className="w-full bg-destructive/10 border border-destructive/20 text-foreground p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-card text-destructive flex items-center justify-center shrink-0 shadow-2xs border border-destructive/20">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground tracking-wide uppercase">
              OVERDUE • ACTION NEEDED
            </span>
            <span className="font-display font-bold text-xs sm:text-sm text-foreground">
              {topOverdue.description}
            </span>
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              {assignee}
            </span>
          </div>
          <p className="text-xs text-muted-foreground pt-0.5">
            {topOverdue.notes ||
              `${assignee}'s chore is past due. Tap below to send a polite automated ping without awkward confrontations.`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        <button
          type="button"
          onClick={() => onSendNudge(topOverdue)}
          className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-full bg-card hover:bg-surface-container text-foreground font-semibold text-xs border border-border/70 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Bell className="w-4 h-4 text-primary" />
          <span>Friendly Nudge 🔔</span>
        </button>
      </div>
    </section>
  );
}
