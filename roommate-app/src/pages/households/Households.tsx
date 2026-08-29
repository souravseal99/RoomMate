import { useState } from 'react';
import { Home, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useHousehold from '@/hooks/useHousehold';
import type { HouseholdResponse } from '@/types/householdTypes';
import HouseholdCard from '@/components/households/HouseholdCard';
import HouseholdCardSkeleton from '@/components/households/HouseholdCardSkeleton';
import HouseholdEmptyState from '@/components/households/HouseholdEmptyState';
import CreateJoinModal from '@/components/households/CreateJoinModal';
import MemberRosterDrawer from '@/components/households/MemberRosterDrawer';
import HouseholdSettingsModal from '@/components/households/HouseholdSettingsModal';
import LeaveHouseholdModal from '@/components/households/LeaveHouseholdModal';
import DeleteHouseholdModal from '@/components/households/DeleteHouseholdModal';

export default function Households() {
  const { households, isLoading } = useHousehold();

  // Modal & Drawer controller states
  const [isCreateJoinOpen, setIsCreateJoinOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'create' | 'join'>('create');

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

  const sortedHouseholds = [...households].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-border">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2.5">
            <Home className="w-7 h-7 text-primary" />
            Households
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            Manage your shared living spaces, invite flatmates, and switch active workspaces.
          </p>
        </div>

        {households.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={openJoinModal}
              variant="outline"
              size="sm"
              className="bg-surface hover:bg-surface-container border-border text-foreground font-bold active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              Join Space
            </Button>
            <Button
              onClick={openCreateModal}
              size="sm"
              className="bg-primary-container hover:opacity-90 text-primary-foreground font-bold active:scale-95 transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create Space
            </Button>
          </div>
        )}
      </header>

      {/* Main Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <HouseholdCardSkeleton key={index} />
          ))}
        </div>
      ) : households.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {sortedHouseholds.map((household) => (
            <HouseholdCard
              key={household.householdId}
              household={household}
              onOpenRoster={(h) => setRosterHousehold(h)}
              onOpenEdit={(h) => setEditHousehold(h)}
              onOpenLeave={(h) => setLeaveHousehold(h)}
              onOpenDelete={(h) => setDeleteHousehold(h)}
            />
          ))}

          {/* Interactive Dashed "Create Household" Bento Card from Stitch prototype */}
          <button
            type="button"
            onClick={openCreateModal}
            className="border-[1.5px] border-dashed border-border hover:border-primary bg-card/40 hover:bg-surface-container/60 p-card-padding flex flex-col items-center justify-center gap-3 cursor-pointer min-h-[190px] rounded-lg transition-all active:scale-[0.98] text-foreground group"
          >
            <div className="w-12 h-12 rounded-full border border-border bg-surface flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="font-bold text-sm text-foreground">Create Household</span>
          </button>
        </div>
      ) : (
        <HouseholdEmptyState
          onCreateClick={openCreateModal}
          onJoinClick={openJoinModal}
        />
      )}

      {/* Setup Home Bento Modal */}
      <CreateJoinModal
        open={isCreateJoinOpen}
        onOpenChange={setIsCreateJoinOpen}
        defaultTab={activeModalTab}
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
