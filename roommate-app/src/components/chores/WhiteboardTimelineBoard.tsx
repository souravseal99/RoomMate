import { CheckCircle2, Clock, Info, Check, Trash2, ArrowLeftRight, Sparkles } from 'lucide-react';
import type { ChoreItem } from '@/types/choreTypes';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface WhiteboardTimelineBoardProps {
  todayChores: ChoreItem[];
  upcomingChores: ChoreItem[];
  completedChores: ChoreItem[];
  currentUserName?: string;
  onToggleChore: (chore: ChoreItem) => void;
  onDeleteChore: (choreId: string) => void;
  onRequestSwap: (chore: ChoreItem) => void;
  onTakeOverChore: (chore: ChoreItem) => void;
}

function getInitials(name?: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function formatChoreSchedule(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Scheduled';
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const timeStr = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    return `${dayName.toUpperCase()}, ${timeStr}`;
  } catch {
    return 'Scheduled';
  }
}

export function WhiteboardTimelineBoard({
  todayChores,
  upcomingChores,
  completedChores,
  currentUserName = 'You',
  onToggleChore,
  onDeleteChore,
  onRequestSwap,
  onTakeOverChore,
}: WhiteboardTimelineBoardProps) {
  const isAssignedToMe = (chore: ChoreItem) => {
    if (!chore.assignedToName) return false;
    return (
      chore.assignedToName.toLowerCase() === currentUserName.toLowerCase() ||
      chore.assignedToName.toLowerCase().includes('you')
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* SECTION 1: Due Today */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
              Due Today
            </h2>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Action Needed Before Bedtime
            </span>
          </div>
          <Badge
            variant="outline"
            className="text-[11px] font-extrabold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border-primary/20"
          >
            {todayChores.filter((c) => !c.completed).length} PENDING
          </Badge>
        </div>

        {todayChores.length === 0 ? (
          <Card className="p-8 text-center bg-card rounded-2xl border-dashed border-border/70 text-muted-foreground text-xs space-y-1">
            <Sparkles className="w-6 h-6 text-primary/40 mx-auto" />
            <p className="font-bold text-foreground">No duties pending today</p>
            <p className="text-[11px]">The household chores board is clear for today.</p>
          </Card>
        ) : (
          todayChores.map((chore) => {
            const isMe = isAssignedToMe(chore);
            const initials = getInitials(chore.assignedToName);

            return (
              <Card
                key={chore.choreId}
                className="bg-card p-4 sm:p-5 rounded-2xl border-border/70 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between group"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  {/* Tactile Stamp Circle */}
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleChore(chore)}
                    aria-label={`Mark ${chore.description} complete`}
                    className={`w-11 h-11 min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer active:scale-90 shadow-2xs border ${
                      chore.completed
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : isMe
                          ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary hover:text-primary-foreground'
                          : 'bg-surface-container text-muted-foreground border-border hover:bg-surface-container-high'
                    }`}
                  >
                    <Check
                      className={`w-5 h-5 stroke-[2.5] ${chore.completed ? '' : 'opacity-70'}`}
                    />
                  </Button>

                  <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {isMe ? (
                        <Badge
                          variant="default"
                          className="px-2.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-extrabold uppercase tracking-wide"
                        >
                          ASSIGNED TO YOU
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="px-2.5 py-0.5 rounded-full bg-surface-container text-foreground text-[10px] font-bold uppercase tracking-wide border-border/50 flex items-center gap-1"
                        >
                          <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[9px] flex items-center justify-center font-bold">
                            {initials}
                          </span>
                          {chore.assignedToName || 'OPEN'}
                        </Badge>
                      )}

                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 rounded-full bg-surface-container-low text-muted-foreground text-[10px] font-semibold uppercase tracking-wide border border-border/40"
                      >
                        {chore.priority === 'HIGH' ? '🔥 HIGH PRIORITY' : 'ROTA DUTY'}
                      </Badge>

                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 rounded-full bg-primary/10 text-primary border-primary/20 text-[10px] font-extrabold"
                      >
                        +15 KARMA
                      </Badge>
                    </div>

                    <h3
                      className={`font-display font-bold text-sm sm:text-base text-foreground ${
                        chore.completed ? 'line-through opacity-60' : ''
                      }`}
                    >
                      {chore.description}
                    </h3>

                    {chore.notes && (
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Info className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span>{chore.notes}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Action Controls */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onRequestSwap(chore)}
                    className="px-3.5 min-h-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs border-border/60 transition-all cursor-pointer active:scale-95 flex items-center gap-1"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Request Swap ⇄</span>
                  </Button>

                  <Button
                    type="button"
                    variant={chore.completed ? 'outline' : 'default'}
                    onClick={() => onToggleChore(chore)}
                    className={`px-4 min-h-[44px] rounded-full font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-xs flex items-center gap-1.5 ${
                      chore.completed
                        ? 'bg-surface-container text-muted-foreground hover:bg-surface-container-high border-border/60'
                        : 'bg-primary text-primary-foreground hover:bg-primary/90'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{chore.completed ? 'Undo' : 'Mark Done ✨'}</span>
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteChore(chore.choreId)}
                    title="Delete chore"
                    aria-label={`Delete ${chore.description}`}
                    className="min-h-[44px] min-w-[44px] rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors flex items-center justify-center cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* SECTION 2: Upcoming This Week */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-muted-foreground/60" />
            <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
              Upcoming This Week
            </h2>
            <span className="hidden sm:inline-block text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Shared House Rota
            </span>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground">
            {upcomingChores.length} SCHEDULED
          </span>
        </div>

        {upcomingChores.length === 0 ? (
          <Card className="p-6 text-center bg-card/60 rounded-2xl border-dashed border-border/60 text-muted-foreground text-xs">
            No upcoming chores scheduled for the rest of this cycle.
          </Card>
        ) : (
          upcomingChores.map((chore) => {
            const isMe = isAssignedToMe(chore);
            const initials = getInitials(chore.assignedToName);

            return (
              <Card
                key={chore.choreId}
                className="bg-card p-4 rounded-2xl border-border/70 shadow-xs hover:shadow-sm transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between"
              >
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center shrink-0 border border-border/50">
                    <span className="font-display font-bold text-xs text-foreground">
                      {initials}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge
                        variant="secondary"
                        className="px-2 py-0.5 rounded-full bg-surface-container text-foreground text-[10px] font-semibold uppercase tracking-wider"
                      >
                        {chore.assignedToName || 'OPEN'}
                      </Badge>
                      <span className="text-[11px] font-bold text-primary flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatChoreSchedule(chore.nextDue)}
                      </span>
                      <Badge
                        variant="outline"
                        className="px-2 py-0.5 rounded-full bg-surface-container-low text-muted-foreground text-[10px] font-semibold uppercase tracking-wider border-border/40"
                      >
                        {chore.frequency}
                      </Badge>
                    </div>

                    <h3 className="font-display font-semibold text-sm text-foreground">
                      {chore.description}
                    </h3>

                    {chore.notes && <p className="text-xs text-muted-foreground">{chore.notes}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onRequestSwap(chore)}
                    className="px-3.5 min-h-[44px] rounded-full bg-surface-container-low hover:bg-surface-container text-foreground font-semibold text-xs border-border/50 transition-colors cursor-pointer active:scale-95"
                  >
                    Swap ⇄
                  </Button>

                  {!isMe && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => onTakeOverChore(chore)}
                      className="px-3.5 min-h-[44px] rounded-full bg-primary/10 hover:bg-primary/20 text-primary border-primary/20 font-bold text-xs transition-colors cursor-pointer active:scale-95"
                    >
                      Take Over (+10)
                    </Button>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* SECTION 3: Completed & Accountable Log */}
      <div className="flex flex-col gap-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <h2 className="font-display font-bold text-base sm:text-lg text-foreground">
              Completed &amp; Accountable Log
            </h2>
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            PAST 48 HOURS
          </span>
        </div>

        {completedChores.length === 0 ? (
          <Card className="p-6 text-center bg-surface-container-low/40 rounded-2xl border-dashed border-border/60 text-muted-foreground text-xs shadow-none">
            No chores marked complete yet this cycle. Check off items above to verify.
          </Card>
        ) : (
          completedChores.slice(0, 5).map((chore) => (
            <Card
              key={chore.choreId}
              className="bg-surface-container-low/60 p-3.5 sm:p-4 rounded-xl flex items-center justify-between gap-3 border-border/40 transition-colors shadow-none"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleChore(chore)}
                  title="Uncheck chore"
                  className="w-8 h-8 min-w-[32px] min-h-[32px] rounded-full bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center shrink-0 cursor-pointer active:scale-90 p-0"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </Button>

                <div className="flex flex-col min-w-0">
                  <span className="font-display font-medium text-xs sm:text-sm text-foreground line-through opacity-70 truncate">
                    {chore.description}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Stamped by {chore.assignedToName || 'Flatmate'} •{' '}
                    <strong className="text-primary font-bold">+10 Karma</strong>
                  </span>
                </div>
              </div>

              <Badge
                variant="outline"
                className="px-2.5 py-1 rounded bg-surface-container text-muted-foreground font-extrabold text-[10px] uppercase tracking-wider shrink-0 border-border/40"
              >
                VERIFIED
              </Badge>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

export default WhiteboardTimelineBoard;
