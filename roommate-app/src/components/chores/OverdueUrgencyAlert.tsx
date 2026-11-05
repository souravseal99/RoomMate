import { Clock, Bell } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface OverdueUrgencyAlertProps {
  overdueChores: ChoreItem[];
  onSendNudge: (chore: ChoreItem) => void;
}

export function OverdueUrgencyAlert({ overdueChores, onSendNudge }: OverdueUrgencyAlertProps) {
  if (overdueChores.length === 0) return null;

  const topOverdue = overdueChores[0];
  const assignee = topOverdue.assignedToName || 'Flatmate';

  return (
    <Card className="w-full bg-destructive/10 border-destructive/20 text-foreground p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all">
      <div className="flex items-start sm:items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-card text-destructive flex items-center justify-center shrink-0 shadow-2xs border border-destructive/20">
          <Clock className="w-5 h-5 stroke-[2.2]" />
        </div>

        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="destructive"
              className="text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide"
            >
              OVERDUE • ACTION NEEDED
            </Badge>
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
        <Button
          type="button"
          variant="outline"
          onClick={() => onSendNudge(topOverdue)}
          className="inline-flex items-center gap-1.5 px-4 min-h-[44px] rounded-full bg-card hover:bg-surface-container text-foreground font-semibold text-xs border-border/70 transition-all shadow-xs cursor-pointer active:scale-95"
        >
          <Bell className="w-4 h-4 text-primary" />
          <span>Friendly Nudge 🔔</span>
        </Button>
      </div>
    </Card>
  );
}

export default OverdueUrgencyAlert;
