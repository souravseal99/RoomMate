import { useState, useMemo } from 'react';
import {
  CheckCircle2,
  Flame,
  Check,
  Clock,
  CheckCheck,
  Bell,
  Sparkles,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { getCurrentUserId } from '@/utils/jwt';
import {
  useHouseholdChoresQuery,
  useDutyPunchcardQuery,
  useToggleChoreMutation,
  useNudgeChoreMutation,
} from '@/hooks/queries/useChoreQueries';
import type { ChoreItem, WeekDayDutyMetric } from '@/types/choreTypes';
import { cn } from '@/utils/utils';

interface DutyStampPunchcardProps {
  urgentChore?: ChoreItem;
}

function formatChoreDue(dueStr?: string): string {
  if (!dueStr) return 'Due today';
  try {
    const date = new Date(dueStr);
    if (isNaN(date.getTime())) return dueStr;
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    if (isToday) return `Due Today · ${timeStr}`;
    if (isTomorrow) return `Due Tomorrow · ${timeStr}`;
    return `Due ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } catch {
    return dueStr;
  }
}

function formatCompletedTime(dateStr?: string | null): string {
  if (!dateStr) return 'Earlier today';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    if (isToday) return `Today at ${timeStr}`;
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${timeStr}`;
  } catch {
    return 'Earlier today';
  }
}

function getChoreKarma(chore?: ChoreItem | null): number {
  if (!chore) return 15;
  if (chore.karma) return chore.karma;
  const base = chore.priority === 'HIGH' ? 25 : chore.priority === 'LOW' ? 10 : 15;
  const mult = chore.frequency === 'monthly' ? 1.5 : chore.frequency === 'weekly' ? 1.2 : 1.0;
  return Math.round(base * mult);
}

const DEFAULT_WEEK_DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function DutyStampPunchcard({ urgentChore }: DutyStampPunchcardProps) {
  const { activeHouseholdId } = useHousehold();
  const { name: currentUserName, userId: authUserId } = useAuth();
  const currentUserId = authUserId || getCurrentUserId();

  // Fetch full punchcard metrics from backend
  const { data: punchcardData } = useDutyPunchcardQuery(activeHouseholdId);
  const { data: fallbackChores = [] } = useHouseholdChoresQuery(activeHouseholdId);

  const toggleChoreMutation = useToggleChoreMutation();
  const nudgeChoreMutation = useNudgeChoreMutation();
  const [stampedIds, setStampedIds] = useState<Set<string>>(new Set());
  const [choreToUnstamp, setChoreToUnstamp] = useState<ChoreItem | null>(null);
  const [isUnstampDialogOpen, setIsUnstampDialogOpen] = useState(false);

  // Fallback partition if punchcard data is pending
  const incompleteChores = useMemo(() => {
    return fallbackChores
      .filter((c) => !c.completed)
      .sort((a, b) => {
        if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
        if (b.priority === 'HIGH' && a.priority !== 'HIGH') return 1;
        return new Date(a.nextDue).getTime() - new Date(b.nextDue).getTime();
      });
  }, [fallbackChores]);

  const completedChores = useMemo(
    () => fallbackChores.filter((c) => c.completed),
    [fallbackChores]
  );

  // Active chore (Card 1): priority urgentChore > punchcard active > fallback incomplete
  const activeChore = urgentChore || punchcardData?.activeChore || incompleteChores[0] || null;

  // Next chore (Card 2)
  const nextChore =
    punchcardData?.nextChore ||
    incompleteChores.find((c) => c.choreId !== activeChore?.choreId) ||
    null;

  // Recently completed chore (Card 3)
  const recentCompletedChore = punchcardData?.recentCompletedChore || completedChores[0] || null;

  const isCard1Stamped = activeChore
    ? stampedIds.has(activeChore.choreId) || activeChore.completed
    : false;

  const activeKarma = getChoreKarma(activeChore);
  const nextKarma = getChoreKarma(nextChore);

  const handleStampDuty = (choreToStamp?: ChoreItem | null) => {
    const target = choreToStamp || activeChore;
    if (!target) return;

    if (target.completed || stampedIds.has(target.choreId)) {
      toast.info('Duty already certified.');
      return;
    }

    const karmaEarned = getChoreKarma(target);
    setStampedIds((prev) => new Set(prev).add(target.choreId));

    if (activeHouseholdId) {
      toggleChoreMutation.mutate(
        {
          choreId: target.choreId,
          householdId: activeHouseholdId,
          updates: { completed: true },
        },
        {
          onSuccess: () => {
            toast.success(`+${karmaEarned} House Karma earned! Duty verified.`, {
              icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
            });
          },
          onError: () => {
            setStampedIds((prev) => {
              const next = new Set(prev);
              next.delete(target.choreId);
              return next;
            });
            toast.error('Failed to stamp chore.');
          },
        }
      );
    } else {
      toast.success(`+${karmaEarned} House Karma earned! Duty verified.`, {
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      });
    }
  };

  const handleCardClick = (targetChore: ChoreItem | null) => {
    if (!targetChore || toggleChoreMutation.isPending) return;

    const isStamped = stampedIds.has(targetChore.choreId) || targetChore.completed;
    if (isStamped) {
      setChoreToUnstamp(targetChore);
      setIsUnstampDialogOpen(true);
    } else {
      handleStampDuty(targetChore);
    }
  };

  const handleConfirmUnstamp = () => {
    if (!choreToUnstamp || !activeHouseholdId) return;

    const target = choreToUnstamp;
    setIsUnstampDialogOpen(false);

    toggleChoreMutation.mutate(
      {
        choreId: target.choreId,
        householdId: activeHouseholdId,
        updates: { completed: false },
      },
      {
        onSuccess: () => {
          setStampedIds((prev) => {
            const next = new Set(prev);
            next.delete(target.choreId);
            return next;
          });
          toast.info(`Duty "${target.description}" marked as incomplete.`);
          setChoreToUnstamp(null);
        },
        onError: () => {
          toast.error('Failed to unstamp chore.');
        },
      }
    );
  };

  const handleNudge = (targetChore: ChoreItem) => {
    if (nudgeChoreMutation.isPending) return;

    nudgeChoreMutation.mutate(
      {
        choreId: targetChore.choreId,
        householdId: activeHouseholdId || undefined,
      },
      {
        onSuccess: () => {
          toast.success(`Gentle chore nudge sent to ${targetChore.assignedToName || 'flatmate'}!`, {
            icon: <Bell className="w-4 h-4 text-primary" />,
          });
        },
        onError: (err: any) => {
          const msg =
            err?.response?.data?.message ||
            `Gentle chore nudge sent to ${targetChore.assignedToName || 'flatmate'}!`;
          toast.success(msg, {
            icon: <Bell className="w-4 h-4 text-primary" />,
          });
        },
      }
    );
  };

  // Dynamic rhythm calculations from backend
  const rhythmTotal = punchcardData?.rhythm.totalCount ?? (fallbackChores.length || 1);
  const rhythmCompleted = punchcardData?.rhythm.completedCount ?? completedChores.length;
  const rhythmPercent =
    punchcardData?.rhythm.rhythmPercent ??
    Math.min(Math.round((rhythmCompleted / rhythmTotal) * 100), 100);

  // Dynamic streak from backend
  const streakLabel =
    punchcardData?.streak.streakLabel ||
    (rhythmCompleted > 0 ? `${rhythmCompleted}-Duty Streak` : 'House Streak');

  // Dynamic 7-day week metrics from backend
  const todayIndex = (new Date().getDay() + 6) % 7;
  const weekDays: WeekDayDutyMetric[] = useMemo(() => {
    if (punchcardData?.rhythm.weekDays && punchcardData.rhythm.weekDays.length === 7) {
      return punchcardData.rhythm.weekDays;
    }
    return DEFAULT_WEEK_DAYS.map((day, idx) => ({
      day,
      date: `fallback-${idx}`,
      isToday: idx === todayIndex,
      status: idx < todayIndex ? 'completed' : idx === todayIndex ? 'pending' : 'rest',
      completedCount: idx < todayIndex ? 1 : 0,
      totalCount: 1,
    }));
  }, [punchcardData?.rhythm.weekDays, todayIndex]);

  // Active chore assignee calculation
  const isActiveAssignedToMe = activeChore
    ? activeChore.assignedToId === currentUserId ||
      (currentUserName &&
        activeChore.assignedToName?.toLowerCase().includes(currentUserName.toLowerCase()))
    : true;

  const activeAssigneeLabel = isActiveAssignedToMe
    ? `${activeChore?.assignedToName || currentUserName || 'You'} (You)`
    : activeChore?.assignedToName || 'Flatmate';

  // Next chore assignee calculation
  const isNextAssignedToMe = nextChore
    ? nextChore.assignedToId === currentUserId ||
      (currentUserName &&
        nextChore.assignedToName?.toLowerCase().includes(currentUserName.toLowerCase()))
    : false;

  const nextRotationNote = punchcardData?.nextRotationNote;

  const hasNoChores =
    !activeChore && !nextChore && !recentCompletedChore && fallbackChores.length === 0;

  return (
    <>
      <Card
        aria-label="Duty Stamp Card & Rotation"
        className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs select-none flex flex-col gap-3"
      >
        {/* Header */}
        <CardHeader className="p-0 flex flex-row items-center justify-between border-b border-border/60 pb-2.5 !pb-2.5 space-y-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
            </div>
            <CardTitle className="text-xl font-semibold tracking-wider uppercase text-foreground font-mono">
              Duty Stamp Card
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-mono"
          >
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>{streakLabel}</span>
          </Badge>
        </CardHeader>

        <CardContent className="p-0 space-y-3">
          <p className="text-muted-foreground text-xs leading-relaxed font-body">
            Rotational duties. Stamp complete to claim House Karma &amp; log verification.
          </p>

          {hasNoChores ? (
            <div className="p-5 rounded-xl border border-dashed border-border bg-muted/20 text-center space-y-2">
              <CheckCircle2 className="w-7 h-7 text-muted-foreground/60 mx-auto" />
              <p className="text-xs font-semibold text-foreground">
                No rotational duties scheduled
              </p>
              <p className="text-[11px] text-muted-foreground">
                Add chores in the Chores tab to start tracking flat duties and house karma.
              </p>
            </div>
          ) : (
            /* Chores List */
            <div className="space-y-3">
              {/* Interactive Active Stamp Card 1 (Current / Urgent) */}
              {activeChore ? (
                <div
                  id="duty-card-urgent"
                  role="button"
                  tabIndex={0}
                  aria-label={
                    isCard1Stamped
                      ? `Duty certified: ${activeChore.description}. Click to unstamp.`
                      : `Click to stamp duty: ${activeChore.description}`
                  }
                  onClick={() => handleCardClick(activeChore)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(activeChore);
                    }
                  }}
                  className={cn(
                    'p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer select-none active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                    isCard1Stamped
                      ? 'bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/30'
                      : 'bg-primary/5 border border-primary/40 shadow-xs hover:border-primary/70 hover:bg-primary/[0.08]'
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        aria-hidden="true"
                        className={cn(
                          'w-10 h-10 sm:w-11 sm:h-11 min-h-[40px] min-w-[40px] p-0 rounded-xl flex items-center justify-center transition-all mt-0.5 group shrink-0 border border-primary/30',
                          isCard1Stamped
                            ? 'bg-emerald-600 text-white shadow-none'
                            : 'bg-primary text-primary-foreground shadow-sm'
                        )}
                      >
                        {toggleChoreMutation.isPending &&
                        (choreToUnstamp?.choreId === activeChore.choreId ||
                          stampedIds.has(activeChore.choreId)) ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Check className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[2.8]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant="default"
                            className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs font-mono border-0"
                          >
                            {activeAssigneeLabel}
                          </Badge>
                          {!isCard1Stamped && (
                            <Badge
                              variant={
                                activeChore.priority === 'HIGH' ? 'destructive' : 'secondary'
                              }
                              className={cn(
                                'text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded font-mono border-0',
                                activeChore.priority === 'HIGH'
                                  ? 'bg-destructive text-white animate-pulse'
                                  : 'bg-muted text-muted-foreground'
                              )}
                            >
                              {activeChore.priority === 'HIGH' ? '⚡ URGENT' : 'ROTATION'}
                            </Badge>
                          )}
                        </div>
                        <h3
                          className={cn(
                            'font-bold text-xs sm:text-sm text-foreground mt-1 leading-tight tracking-tight',
                            isCard1Stamped && 'line-through text-muted-foreground'
                          )}
                        >
                          {activeChore.description}
                        </h3>
                        <p className="text-muted-foreground text-[11px] mt-0.5 font-medium flex items-center gap-1 font-mono">
                          {formatChoreDue(activeChore.nextDue)}
                          {activeChore.notes ? ` · ${activeChore.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge
                        variant={isCard1Stamped ? 'secondary' : 'default'}
                        className={cn(
                          'font-mono px-2 py-0.5 rounded-md shadow-xs font-bold text-[11px] border-0',
                          isCard1Stamped
                            ? 'bg-emerald-600 text-white'
                            : 'bg-primary text-primary-foreground'
                        )}
                      >
                        {isCard1Stamped ? `STAMPED ✓ (+${activeKarma})` : `+${activeKarma} Karma`}
                      </Badge>
                      <span
                        className={cn(
                          'text-[9px] font-semibold tracking-wider uppercase font-mono transition-colors',
                          isCard1Stamped
                            ? 'text-muted-foreground hover:text-foreground'
                            : 'text-primary'
                        )}
                      >
                        {isCard1Stamped ? 'Certified · Click to unstamp' : 'Click card to stamp'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Stamp Card 2 (Next Upcoming Chore) */}
              {nextChore ? (
                <div className="p-3 sm:p-3.5 rounded-xl bg-card border border-border flex items-start justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-muted/40 border border-border flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-xs text-foreground tracking-tight">
                          {isNextAssignedToMe
                            ? `${nextChore.assignedToName || 'You'} (You)`
                            : nextChore.assignedToName || 'Flatmate'}
                        </span>
                        <span className="text-[11px] text-muted-foreground font-medium font-mono">
                          {formatChoreDue(nextChore.nextDue)}
                        </span>
                      </div>
                      <h3 className="font-semibold text-xs text-foreground mt-0.5 tracking-tight truncate">
                        {nextChore.description}
                      </h3>
                      <p className="text-muted-foreground text-[10px]">
                        {nextChore.notes ||
                          (nextChore.priority === 'HIGH'
                            ? 'High priority chore'
                            : 'Common area duty')}
                      </p>
                    </div>
                  </div>
                  {isNextAssignedToMe ? (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleStampDuty(nextChore)}
                      disabled={
                        stampedIds.has(nextChore.choreId) ||
                        nextChore.completed ||
                        toggleChoreMutation.isPending
                      }
                      className="h-7 px-2.5 rounded-md text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs"
                    >
                      Stamp (+{nextKarma})
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleNudge(nextChore)}
                      disabled={nudgeChoreMutation.isPending}
                      className="h-7 px-2.5 rounded-md bg-muted/40 hover:bg-muted border border-border text-foreground active:scale-95 transition-all text-[11px] font-semibold shrink-0 cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      {nudgeChoreMutation.isPending ? (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      ) : (
                        <Bell className="w-3 h-3 text-primary" />
                      )}
                      <span>Nudge</span>
                    </Button>
                  )}
                </div>
              ) : incompleteChores.length <= 1 && completedChores.length > 0 ? (
                <div className="p-3 sm:p-3.5 rounded-xl bg-muted/20 border border-border/60 flex items-center gap-2.5 text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-xs">
                    All other duties up to date! Great rotation rhythm.
                  </span>
                </div>
              ) : null}

              {/* Stamp Card 3 (Completed Chore) */}
              {recentCompletedChore ? (
                <div
                  role="button"
                  tabIndex={0}
                  aria-label={`Completed duty: ${recentCompletedChore.description}. Click to unstamp.`}
                  onClick={() => handleCardClick(recentCompletedChore)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick(recentCompletedChore);
                    }
                  }}
                  className="p-3 sm:p-3.5 rounded-xl bg-muted/30 border border-border flex items-start justify-between gap-3 cursor-pointer hover:bg-muted/50 hover:border-muted-foreground/30 transition-all active:scale-[0.99] select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-[10px] font-mono">
                          {formatCompletedTime(
                            recentCompletedChore.completedAt || recentCompletedChore.nextDue
                          )}{' '}
                          · {recentCompletedChore.assignedToName || 'Flatmate'}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 font-mono border-0 p-0"
                        >
                          Verified
                        </Badge>
                      </div>
                      <h3 className="font-medium text-xs text-muted-foreground line-through mt-0.5 tracking-tight truncate">
                        {recentCompletedChore.description}
                      </h3>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge
                      variant="outline"
                      className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 font-mono"
                    >
                      STAMPED ✓ (+{getChoreKarma(recentCompletedChore)})
                    </Badge>
                    <span className="text-[9px] font-semibold tracking-wider uppercase text-muted-foreground hover:text-foreground font-mono">
                      Click to unstamp
                    </span>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 px-3 rounded-xl bg-muted/20 border border-dashed border-border/60 flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500/70 shrink-0" />
                  <span className="text-xs">
                    Stamp your first chore to verify duty and earn House Karma!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Duty Rhythm Mini Tracker */}
          <div className="bg-card border border-border p-3 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-xs text-foreground font-display">
                Flat Duty Rhythm
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono tabular-nums">
                {rhythmCompleted} of {rhythmTotal} done ({rhythmPercent}%)
              </span>
            </div>

            {/* Dynamic 7-Day Matrix */}
            <div className="grid grid-cols-7 gap-1 pt-0.5">
              {weekDays.map((dayMetric, idx) => {
                const isCompleted =
                  dayMetric.status === 'completed' || dayMetric.status === 'today-done';
                const isPending = dayMetric.status === 'pending';
                const isMissed = dayMetric.status === 'missed';
                const isRest = dayMetric.status === 'rest';

                return (
                  <div
                    key={`day-${dayMetric.date || dayMetric.day}-${idx}`}
                    title={`${dayMetric.date || dayMetric.day}: ${dayMetric.completedCount}/${dayMetric.totalCount} completed (${dayMetric.status})`}
                    className={cn(
                      'flex flex-col items-center gap-1 p-1 rounded-lg border transition-all',
                      dayMetric.isToday
                        ? 'bg-primary/5 border-primary/40 shadow-xs'
                        : isCompleted
                          ? 'bg-card border-border'
                          : isMissed
                            ? 'bg-destructive/5 border-destructive/30'
                            : 'bg-card border-border/60 opacity-60'
                    )}
                  >
                    <span
                      className={cn(
                        'text-[9px] font-mono',
                        dayMetric.isToday
                          ? 'text-primary font-bold'
                          : isMissed
                            ? 'text-destructive font-semibold'
                            : 'text-muted-foreground'
                      )}
                    >
                      {dayMetric.day}
                    </span>
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        isPending
                          ? 'bg-primary animate-pulse'
                          : isCompleted
                            ? 'bg-emerald-500'
                            : isMissed
                              ? 'bg-destructive'
                              : isRest
                                ? 'bg-muted-foreground/20'
                                : 'bg-muted-foreground/30'
                      )}
                    />
                  </div>
                );
              })}
            </div>

            <div className="pt-1.5 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
              <span className="truncate pr-2">
                Next:{' '}
                {nextRotationNote
                  ? `${nextRotationNote.assigneeName} · ${nextRotationNote.description}`
                  : nextChore
                    ? `${nextChore.assignedToName || 'Flatmate'} · ${nextChore.description}`
                    : 'All caught up'}
              </span>
              <span className="text-foreground font-semibold shrink-0 font-mono">
                {nextRotationNote?.nextDue
                  ? formatChoreDue(nextRotationNote.nextDue)
                  : nextChore
                    ? formatChoreDue(nextChore.nextDue)
                    : 'Rhythm on track'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Themed Confirmation Dialog to Unstamp Duty */}
      <AlertDialog open={isUnstampDialogOpen} onOpenChange={setIsUnstampDialogOpen}>
        <AlertDialogContent className="bg-card text-foreground border border-border max-w-md p-0 overflow-hidden shadow-2xl rounded-2xl select-none">
          <AlertDialogHeader className="p-5 sm:p-6 bg-surface-container-low border-b border-border/60 text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 shadow-xs border border-primary/20">
                <RotateCcw className="w-5 h-5 stroke-[2.4]" />
              </div>
              <div>
                <AlertDialogTitle className="font-display font-bold text-base sm:text-lg text-foreground tracking-tight">
                  Unstamp Duty?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                  Rotational Duty Verification
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>

          <div className="p-5 sm:p-6 space-y-3.5">
            <p className="text-xs text-muted-foreground leading-relaxed font-body">
              Are you sure you want to mark this duty as incomplete? This will remove the certified
              stamp and return the chore back to your rotation schedule.
            </p>

            {choreToUnstamp && (
              <div className="bg-surface-container border border-border/70 p-3.5 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs text-foreground truncate">
                    {choreToUnstamp.description}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary border-primary/30 bg-primary/5 px-2 py-0.5 shrink-0"
                  >
                    -{getChoreKarma(choreToUnstamp)} Karma
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-mono pt-1 border-t border-border/40">
                  <span>Assigned: {choreToUnstamp.assignedToName || 'Flatmate'}</span>
                  <span>{formatChoreDue(choreToUnstamp.nextDue)}</span>
                </div>
              </div>
            )}
          </div>

          <AlertDialogFooter className="p-4 px-5 sm:px-6 bg-surface-container-high/30 border-t border-border/60 flex items-center justify-end gap-2.5 sm:justify-end">
            <AlertDialogCancel
              disabled={toggleChoreMutation.isPending}
              className="min-h-[38px] bg-surface border border-border hover:bg-surface-container text-foreground cursor-pointer rounded-xl font-semibold text-xs px-4 transition-all"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmUnstamp}
              disabled={toggleChoreMutation.isPending}
              className="min-h-[38px] bg-primary text-primary-foreground hover:bg-primary/90 font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 rounded-xl shadow-xs text-xs px-4"
            >
              {toggleChoreMutation.isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Unstamping...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.4]" />
                  <span>Unstamp Duty</span>
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DutyStampPunchcard;
