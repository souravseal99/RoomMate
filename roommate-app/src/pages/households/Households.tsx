import { useState, useMemo } from 'react';
import { Home, Plus, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useHousehold from '@/hooks/useHousehold';
import type { HouseholdResponse } from '@/types/householdTypes';
import {
  CurrentSpaceHeroCard,
  OtherSpaceCard,
  InviteRoommatesModal,
  CurrentSpaceHeroSkeleton,
  OtherSpacesGridSkeleton,
  HouseholdEmptyState,
  CreateJoinModal,
  MemberRosterDrawer,
  HouseholdSettingsModal,
  LeaveHouseholdModal,
  DeleteHouseholdModal,
} from '@/components/households';

export default function Households() {
  const {
    households,
    activeHousehold,
    switchActiveHousehold,
    householdMembers,
    isLoading,
  } = useHousehold();

  // Modal & Drawer controller states
  const [isCreateJoinOpen, setIsCreateJoinOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'create' | 'join'>('create');

  const [inviteHousehold, setInviteHousehold] = useState<HouseholdResponse | null>(null);
  const [rosterHousehold, setRosterHousehold] = useState<HouseholdResponse | null>(null);
  const [editHousehold, setEditHousehold] = useState<HouseholdResponse | null>(null);
  const [leaveHousehold, setLeaveHousehold] = useState<HouseholdResponse | null>(null);
  const [deleteHousehold, setDeleteHousehold] = useState<HouseholdResponse | null>(null);

  const openCreateModal = () => {
    setActiveModalTab('create');
    setIsCreateJoinOpen(true);
  };

  const openJoinModal = () => {
    setActiveModalTab('join');
    setIsCreateJoinOpen(true);
  };

  // Separate active household and other households
  const currentHousehold = useMemo(() => {
    return activeHousehold || households[0] || null;
  }, [activeHousehold, households]);

  const otherHouseholds = useMemo(() => {
    if (!currentHousehold) return [];
    return households.filter((h) => h.householdId !== currentHousehold.householdId);
  }, [households, currentHousehold]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-foreground flex items-center gap-2.5 tracking-tight">
            <Home className="w-6 h-6 md:w-7 md:h-7 text-primary" />
            Household Hub
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage your shared living spaces, invite flatmates, and switch active workspaces.
          </p>
        </div>

        {households.length > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={openJoinModal}
              variant="outline"
              size="sm"
              className="bg-surface-container-low hover:bg-surface-container border-border text-foreground font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Join Space
            </Button>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold active:scale-95 transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          </div>
        )}
      </header>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-8">
          <CurrentSpaceHeroSkeleton />
          <OtherSpacesGridSkeleton />
        </div>
      ) : currentHousehold ? (
        <div className="space-y-8">
          {/* Current Space Featured Hero Card */}
          <CurrentSpaceHeroCard
            household={currentHousehold}
            members={householdMembers}
            onOpenRoster={() => setRosterHousehold(currentHousehold)}
            onOpenInvite={() => setInviteHousehold(currentHousehold)}
            onOpenSettings={() => setEditHousehold(currentHousehold)}
          />

          {/* Your Other Spaces Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between ml-1">
              <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                Your Other Spaces {otherHouseholds.length > 0 && `(${otherHouseholds.length})`}
              </h2>
              <button
                type="button"
                onClick={openCreateModal}
                className="text-primary hover:text-primary/80 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                New Space
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {otherHouseholds.map((household) => (
                <OtherSpaceCard
                  key={household.householdId}
                  household={household}
                  onSwitch={() => switchActiveHousehold(household.householdId)}
                  onOpenRoster={() => setRosterHousehold(household)}
                />
              ))}

              {/* Interactive Dashed Bento Card to Create or Join */}
              <button
                type="button"
                onClick={openCreateModal}
                className="border-[1.5px] border-dashed border-border hover:border-primary/60 bg-surface-container-low/40 hover:bg-surface-container/60 p-4 rounded-2xl flex items-center justify-center gap-3 cursor-pointer min-h-[80px] transition-all active:scale-98 text-foreground group"
              >
                <div className="w-8 h-8 rounded-full border border-border bg-surface flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  <Plus className="w-4 h-4 text-primary" />
                </div>
                <span className="font-bold text-xs text-foreground">
                  Create or Join Another Space
                </span>
              </button>
            </div>
          </section>
        </div>
      ) : (
        <HouseholdEmptyState
          onCreateClick={openCreateModal}
          onJoinClick={openJoinModal}
        />
      )}

      {/* Floating Action Button (FAB) for Easy Mobile Access */}
      <div className="fixed bottom-24 right-4 md:bottom-8 md:right-8 z-40">
        <button
          aria-label="Create or Join Household"
          onClick={openCreateModal}
          className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-lg border border-primary-foreground/20 hover:bg-primary/90 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Setup Home Bento Modal */}
      <CreateJoinModal
        open={isCreateJoinOpen}
        onOpenChange={setIsCreateJoinOpen}
        defaultTab={activeModalTab}
      />

      {/* Invite Roommates Modal */}
      <InviteRoommatesModal
        household={inviteHousehold}
        open={!!inviteHousehold}
        onOpenChange={(open) => !open && setInviteHousehold(null)}
      />

      {/* Slide-over Member Roster Drawer */}
      <MemberRosterDrawer
        household={rosterHousehold}
        open={!!rosterHousehold}
        onOpenChange={(open) => !open && setRosterHousehold(null)}
        onOpenSettings={() => {
          if (rosterHousehold) {
            setEditHousehold(rosterHousehold);
          }
        }}
      />

      {/* Edit Household Name Modal */}
      {editHousehold && (
        <HouseholdSettingsModal
          household={editHousehold}
          open={!!editHousehold}
          onOpenChange={(open) => !open && setEditHousehold(null)}
        />
      )}

      {/* Leave Household Modal */}
      {leaveHousehold && (
        <LeaveHouseholdModal
          household={leaveHousehold}
          open={!!leaveHousehold}
          onOpenChange={(open) => !open && setLeaveHousehold(null)}
        />
      )}

      {/* Delete Household Modal */}
      {deleteHousehold && (
        <DeleteHouseholdModal
          household={deleteHousehold}
          open={!!deleteHousehold}
          onOpenChange={(open) => !open && setDeleteHousehold(null)}
        />
      )}
    </div>
  );
}
