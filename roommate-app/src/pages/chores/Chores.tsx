import { useState, useMemo } from 'react';
import { Plus, AlertTriangle, CheckCircle2, Sparkles, User, Users, Clock, Flame } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  useHouseholdChoresQuery,
  useToggleChoreMutation,
  useDeleteChoreMutation,
} from '@/hooks/queries/useChoreQueries';
import { ChoreTimelineCard } from '@/components/chores/ChoreTimelineCard';
import { AddChoreDialog } from '@/components/chores/AddChoreDialog';
import type { ChoreItem } from '@/types/choreTypes';

type ChoreFilterType = 'MY_CHORES' | 'ALL' | 'TODAY' | 'HIGH_PRIORITY';

export function Chores() {
  const { toast } = useToast();
  const { name: currentUserName } = useAuth();
  const { activeHousehold, selectedHousehold } = useHousehold();
  const activeHouseholdId = activeHousehold?.householdId || selectedHousehold?.key;

  const [filter, setFilter] = useState<ChoreFilterType>('ALL');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const { data: chores = [], isLoading, isError } = useHouseholdChoresQuery(activeHouseholdId);
  const toggleMutation = useToggleChoreMutation();
  const deleteMutation = useDeleteChoreMutation();

  // Categorize chores into timeline sections
  const { overdueChores, todayChores, upcomingChores, completedChores } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Apply active filter
    let filtered = chores;
    if (filter === 'MY_CHORES' && currentUserName) {
      filtered = chores.filter(
        (c) =>
          c.assignedToName &&
          c.assignedToName.toLowerCase() === currentUserName.toLowerCase()
      );
    } else if (filter === 'HIGH_PRIORITY') {
      filtered = chores.filter((c) => c.priority === 'HIGH');
    }

    const overdue: ChoreItem[] = [];
    const dueToday: ChoreItem[] = [];
    const upcoming: ChoreItem[] = [];
    const completed: ChoreItem[] = [];

    filtered.forEach((chore) => {
      if (chore.completed) {
        completed.push(chore);
        return;
      }

      const dueDate = new Date(chore.nextDue);
      dueDate.setHours(0, 0, 0, 0);

      if (dueDate < today) {
        overdue.push(chore);
      } else if (dueDate.getTime() === today.getTime() || isNaN(dueDate.getTime())) {
        dueToday.push(chore);
      } else {
        upcoming.push(chore);
      }
    });

    if (filter === 'TODAY') {
      return {
        overdueChores: overdue,
        todayChores: dueToday,
        upcomingChores: [],
        completedChores: [],
      };
    }

    return {
      overdueChores: overdue,
      todayChores: dueToday,
      upcomingChores: upcoming,
      completedChores: completed,
    };
  }, [chores, filter, currentUserName]);

  const handleToggle = async (chore: ChoreItem) => {
    if (!activeHouseholdId) return;
    const nextCompleted = !chore.completed;
    try {
      await toggleMutation.mutateAsync({
        choreId: chore.choreId,
        householdId: activeHouseholdId,
        updates: { completed: nextCompleted },
      });
      toast({
        title: nextCompleted ? 'Chore Completed! 🎉' : 'Chore Reopened',
        description: `"${chore.description}" status has been updated.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to update chore status.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (choreId: string) => {
    if (!activeHouseholdId) return;
    try {
      await deleteMutation.mutateAsync({
        choreId,
        householdId: activeHouseholdId,
      });
      toast({
        title: 'Chore Deleted',
        description: 'Task removed from household board.',
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to delete chore.',
        variant: 'destructive',
      });
    }
  };

  if (!activeHouseholdId) {
    return (
      <div className="max-w-md mx-auto md:max-w-4xl py-12 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-primary mx-auto opacity-70" />
        <h2 className="text-xl font-extrabold text-foreground">Select a Household</h2>
        <p className="text-sm text-muted-foreground">
          Please select or create a household space to view and manage shared chores.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto md:max-w-4xl py-6 space-y-6">
        <div className="flex gap-2 overflow-x-auto py-1">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-28 rounded-full bg-surface-container animate-pulse shrink-0" />
          ))}
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto md:max-w-4xl py-8 text-center space-y-3">
        <p className="text-destructive font-bold text-base">Failed to load household chores.</p>
        <p className="text-muted-foreground text-xs">Please verify your connection and try again.</p>
      </div>
    );
  }

  const totalActiveChores = overdueChores.length + todayChores.length + upcomingChores.length;

  return (
    <div className="max-w-md mx-auto md:max-w-4xl py-2 space-y-6 relative pb-28">
      {/* 1. Quick Filter Pills Bar */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-4 px-4 md:mx-0 md:px-0">
        <button
          type="button"
          onClick={() => setFilter('ALL')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
            filter === 'ALL'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100'
              : 'bg-surface-container text-foreground border border-border/50 hover:bg-surface-container-high'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>All Chores</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('MY_CHORES')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
            filter === 'MY_CHORES'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100'
              : 'bg-surface-container text-foreground border border-border/50 hover:bg-surface-container-high'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Chores</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('TODAY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
            filter === 'TODAY'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100'
              : 'bg-surface-container text-foreground border border-border/50 hover:bg-surface-container-high'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Today</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('HIGH_PRIORITY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition-all cursor-pointer active:scale-95 ${
            filter === 'HIGH_PRIORITY'
              ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-100'
              : 'bg-surface-container text-foreground border border-border/50 hover:bg-surface-container-high'
          }`}
        >
          <Flame className="w-3.5 h-3.5 text-primary" />
          <span>High Priority</span>
        </button>
      </div>

      {/* 2. Unified Vertical Timeline Stream */}
      <div className="relative ml-2 sm:ml-4 pl-6 sm:pl-8 border-l-2 border-border/40 space-y-8">
        {/* Overdue Section */}
        {overdueChores.length > 0 && (
          <section className="relative space-y-3">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-destructive shadow-[0_0_0_5px_theme('colors.background')]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-destructive">
                Overdue
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive">
                {overdueChores.length} Past Due
              </span>
            </div>

            <div className="bg-destructive/10 border border-destructive/20 text-foreground rounded-2xl p-4 flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground">
                  {overdueChores.length} Chore{overdueChores.length > 1 ? 's' : ''} Past Due
                </p>
                <p className="text-[11px] text-muted-foreground truncate">
                  {overdueChores.map((c) => c.description).join(', ')}
                </p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {overdueChores.map((chore) => (
                <ChoreTimelineCard
                  key={chore.choreId}
                  chore={chore}
                  isOverdue
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Due Today Section */}
        {todayChores.length > 0 && (
          <section className="relative space-y-3">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-primary shadow-[0_0_0_5px_theme('colors.background')]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-primary">
                Today
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                {todayChores.length} Task{todayChores.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-3">
              {todayChores.map((chore) => (
                <ChoreTimelineCard
                  key={chore.choreId}
                  chore={chore}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Section */}
        {upcomingChores.length > 0 && (
          <section className="relative space-y-3">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-muted-foreground/60 shadow-[0_0_0_5px_theme('colors.background')]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Upcoming
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-surface-container text-muted-foreground">
                {upcomingChores.length} Scheduled
              </span>
            </div>

            <div className="space-y-3">
              {upcomingChores.map((chore) => (
                <ChoreTimelineCard
                  key={chore.choreId}
                  chore={chore}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}

        {/* Completed Section */}
        {completedChores.length > 0 && (
          <section className="relative space-y-3 opacity-75">
            <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-3.5 h-3.5 rounded-full bg-green-600 shadow-[0_0_0_5px_theme('colors.background')]" />
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
                Completed
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600/10 text-green-600">
                {completedChores.length} Done 🎉
              </span>
            </div>

            <div className="space-y-3">
              {completedChores.map((chore) => (
                <ChoreTimelineCard
                  key={chore.choreId}
                  chore={chore}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Empty State */}
      {totalActiveChores === 0 && completedChores.length === 0 && (
        <div className="bg-card border border-border rounded-3xl p-10 text-center space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto opacity-80" />
          <h3 className="text-lg font-extrabold text-foreground">All Chores Done! ✨</h3>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            Your shared space is in great shape. Tap the plus button to schedule new household chores.
          </p>
        </div>
      )}

      {/* 3. Floating Action Button (Add Chore) */}
      <button
        type="button"
        onClick={() => setIsAddOpen(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/30 flex items-center justify-center active:scale-90 hover:scale-105 transition-all duration-200 z-40 cursor-pointer"
        aria-label="Add new chore"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Add Chore Dialog */}
      <AddChoreDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}

export default Chores;
