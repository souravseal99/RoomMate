import { useState, useMemo } from 'react';
import { Plus, Sparkles, AlertCircle } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { toast } from 'sonner';
import {
  useHouseholdChoresQuery,
  useToggleChoreMutation,
  useDeleteChoreMutation,
  useCreateChoreMutation,
} from '@/hooks/queries/useChoreQueries';
import {
  ChoresSubHeader,
  HarmonyHealthMeter,
  type ChoreFilterOption,
  OverdueUrgencyAlert,
  WhiteboardTimelineBoard,
  FastTaskCreatorDock,
  FridgeMagnetStandings,
  SwapDutyModal,
  DutyCharterModal,
  AddChoreDialog,
} from '@/components/chores';
import type { ChoreItem, ChoreFrequency, ChorePriority } from '@/types/choreTypes';

export function Chores() {
  const { name: currentUserName = 'Sourav' } = useAuth();
  const { activeHousehold, selectedHousehold, members = [] } = useHousehold();
  const activeHouseholdId = activeHousehold?.householdId || selectedHousehold?.key || '';

  // Filter & Dialog States
  const [filter, setFilter] = useState<ChoreFilterOption>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDutyCharterOpen, setIsDutyCharterOpen] = useState(false);
  const [swapModalChore, setSwapModalChore] = useState<ChoreItem | null>(null);

  // Queries & Mutations
  const { data: chores = [], isLoading, isError } = useHouseholdChoresQuery(activeHouseholdId);
  const toggleMutation = useToggleChoreMutation();
  const deleteMutation = useDeleteChoreMutation();
  const createMutation = useCreateChoreMutation();

  // Cycle range display (computed from current week)
  const cycleRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + 1); // Monday
    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Sunday

    const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `Cycle ${fmt(start)} – ${fmt(end)}`;
  }, []);

  // Filter count metrics
  const {
    allCount,
    mineCount,
    todayCount,
    urgentCount,
    completedCount,
    totalCount,
    overdueChores,
    filteredTodayChores,
    filteredUpcomingChores,
    filteredCompletedChores,
  } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isToday = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === today.getTime() || isNaN(d.getTime());
      } catch {
        return true;
      }
    };

    const isPastDue = (dateStr: string) => {
      try {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);
        return d < today;
      } catch {
        return false;
      }
    };

    const isMe = (chore: ChoreItem) => {
      if (!chore.assignedToName) return false;
      return (
        chore.assignedToName.toLowerCase() === currentUserName.toLowerCase() ||
        chore.assignedToName.toLowerCase().includes('you')
      );
    };

    // Raw metrics
    const all = chores.length;
    const mine = chores.filter((c) => !c.completed && isMe(c)).length;
    const dueToday = chores.filter((c) => !c.completed && isToday(c.nextDue)).length;
    const urgent = chores.filter((c) => !c.completed && c.priority === 'HIGH').length;
    const completed = chores.filter((c) => c.completed).length;

    // Filter application
    let filtered = chores;
    if (filter === 'mine') {
      filtered = chores.filter((c) => isMe(c));
    } else if (filter === 'today') {
      filtered = chores.filter((c) => isToday(c.nextDue) || isPastDue(c.nextDue));
    } else if (filter === 'urgent') {
      filtered = chores.filter((c) => c.priority === 'HIGH');
    }

    const overdueList: ChoreItem[] = [];
    const todayList: ChoreItem[] = [];
    const upcomingList: ChoreItem[] = [];
    const completedList: ChoreItem[] = [];

    // Bucket filtered chores
    filtered.forEach((chore) => {
      if (chore.completed) {
        completedList.push(chore);
      } else if (isPastDue(chore.nextDue)) {
        overdueList.push(chore);
        todayList.push(chore); // Group overdue into today's action block for attention
      } else if (isToday(chore.nextDue)) {
        todayList.push(chore);
      } else {
        upcomingList.push(chore);
      }
    });

    // Compute separate global overdue for alert banner regardless of active filter
    const globalOverdue = chores.filter((c) => !c.completed && isPastDue(c.nextDue));

    return {
      allCount: all,
      mineCount: mine,
      todayCount: dueToday,
      urgentCount: urgent,
      completedCount: completed,
      totalCount: all,
      overdueChores: globalOverdue,
      filteredTodayChores: todayList,
      filteredUpcomingChores: upcomingList,
      filteredCompletedChores: completedList,
    };
  }, [chores, filter, currentUserName]);

  // Actions
  const handleToggleChore = async (chore: ChoreItem) => {
    if (!activeHouseholdId) return;
    const nextCompleted = !chore.completed;
    try {
      await toggleMutation.mutateAsync({
        choreId: chore.choreId,
        householdId: activeHouseholdId,
        updates: { completed: nextCompleted },
      });
      if (nextCompleted) {
        toast.success(`Chore completed! 🎉 (+15 Karma credited)`);
      } else {
        toast.info(`Chore reopened`);
      }
    } catch {
      toast.error('Failed to update chore status');
    }
  };

  const handleDeleteChore = async (choreId: string) => {
    if (!activeHouseholdId) return;
    try {
      await deleteMutation.mutateAsync({
        choreId,
        householdId: activeHouseholdId,
      });
      toast.success('Chore removed from household board');
    } catch {
      toast.error('Failed to delete chore');
    }
  };

  const handlePinFastTask = async (task: {
    description: string;
    assignedToId: string | null;
    assignedToName: string;
    frequency: ChoreFrequency;
    priority: ChorePriority;
    nextDue: string;
  }) => {
    if (!activeHouseholdId) {
      toast.error('Please select an active household');
      return;
    }

    try {
      await createMutation.mutateAsync({
        description: task.description,
        assignedToId: task.assignedToId,
        frequency: task.frequency,
        priority: task.priority,
        nextDue: task.nextDue,
        completed: false,
        householdId: activeHouseholdId,
        notes: `Pinned to whiteboard by ${currentUserName}`,
      });
      toast.success(`Pinned "${task.description}" to the household board! 📌`);
    } catch {
      toast.error('Failed to pin chore to the board');
    }
  };

  const handleSendNudge = (chore: ChoreItem) => {
    const name = chore.assignedToName || 'Flatmate';
    toast.success(`Friendly reminder sent to ${name} for "${chore.description}"! 🔔`);
  };

  const handleConfirmSwap = (chore: ChoreItem, targetFlatmateName: string) => {
    toast.success(`Swap request proposed to ${targetFlatmateName} for "${chore.description}"! ⇄`);
  };

  const handleTakeOverChore = async (chore: ChoreItem) => {
    if (!activeHouseholdId) return;
    try {
      await toggleMutation.mutateAsync({
        choreId: chore.choreId,
        householdId: activeHouseholdId,
        updates: {
          assignedToId: null, // Assign to current user
        },
      });
      toast.success(`You took over "${chore.description}"! (+10 Karma credited)`);
    } catch {
      toast.error('Failed to take over chore');
    }
  };

  if (!activeHouseholdId) {
    return (
      <div className="max-w-md mx-auto md:max-w-4xl py-16 text-center space-y-3">
        <Sparkles className="w-10 h-10 text-primary mx-auto opacity-70" />
        <h2 className="text-xl font-extrabold text-foreground">Select a Household</h2>
        <p className="text-sm text-muted-foreground">
          Please select or join a household space to access the shared chores whiteboard.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full space-y-6 py-6 max-w-7xl mx-auto">
        <div className="h-14 w-full rounded-2xl bg-surface-container animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-2xl bg-surface-container animate-pulse" />
          <div className="lg:col-span-4 h-96 rounded-2xl bg-surface-container animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full py-12 text-center space-y-3 max-w-md mx-auto">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-destructive font-bold text-base">Failed to load household chores.</p>
        <p className="text-muted-foreground text-xs">Please verify your connection and try again.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Header Sub-bar & Context Bar */}
      <ChoresSubHeader
        cycleRange={cycleRange}
        onOpenDutyCharter={() => setIsDutyCharterOpen(true)}
        onOpenAddChore={() => setIsAddDialogOpen(true)}
      />

      {/* 2. Zero-Guilt Filter Bar & Harmony Health Meter */}
      <HarmonyHealthMeter
        activeFilter={filter}
        onFilterChange={setFilter}
        allCount={allCount}
        mineCount={mineCount}
        todayCount={todayCount}
        urgentCount={urgentCount}
        completedCount={completedCount}
        totalCount={totalCount}
      />

      {/* 3. Overdue Gentle Urgency Alert Banner */}
      <OverdueUrgencyAlert
        overdueChores={overdueChores}
        onSendNudge={handleSendNudge}
      />

      {/* 4. Bento Core Grid: 2-Column Split (66% Left / 34% Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Chronological Timeline Board (8 cols desktop) */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <WhiteboardTimelineBoard
            todayChores={filteredTodayChores}
            upcomingChores={filteredUpcomingChores}
            completedChores={filteredCompletedChores}
            currentUserName={currentUserName}
            onToggleChore={handleToggleChore}
            onDeleteChore={handleDeleteChore}
            onRequestSwap={(chore) => setSwapModalChore(chore)}
            onTakeOverChore={handleTakeOverChore}
          />
        </div>

        {/* Right Column: Fast Task Creation & Fridge Standings (4 cols desktop) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <FastTaskCreatorDock
            currentUserName={currentUserName}
            members={members.map((m: any) => ({
              id: m.userId || m.id,
              name: m.name || m.user?.name || 'Flatmate',
            }))}
            isSubmitting={createMutation.isPending}
            onPinTask={handlePinFastTask}
          />

          <FridgeMagnetStandings
            currentUserName={currentUserName}
            chores={chores}
            onOpenDutyCharter={() => setIsDutyCharterOpen(true)}
          />
        </div>
      </div>

      {/* Mobile Floating Action Button (FAB) */}
      <button
        type="button"
        onClick={() => setIsAddDialogOpen(true)}
        aria-label="Add new household chore"
        className="fixed bottom-20 md:bottom-8 right-6 w-14 h-14 bg-primary hover:bg-primary/90 text-primary-foreground rounded-2xl shadow-xl flex items-center justify-center z-40 active:scale-95 transition-all cursor-pointer group"
      >
        <Plus className="w-7 h-7 stroke-[2.5] group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Interactive Modals */}
      <SwapDutyModal
        open={!!swapModalChore}
        chore={swapModalChore}
        onClose={() => setSwapModalChore(null)}
        onConfirmSwap={handleConfirmSwap}
      />

      <DutyCharterModal
        open={isDutyCharterOpen}
        onClose={() => setIsDutyCharterOpen(false)}
      />

      <AddChoreDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        householdId={activeHouseholdId}
      />
    </div>
  );
}
export default Chores;
