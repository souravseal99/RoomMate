import { useState, useMemo } from 'react';
import { Building2, ChevronDown, ChevronUp } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import type { HouseholdResponse } from '@/types/householdTypes';
import {
  CurrentSpaceHeroCard,
  OtherSpaceCard,
  InviteRoommatesModal,
  CurrentSpaceHeroSkeleton,
  HouseholdEmptyState,
  CreateJoinModal,
  HouseholdSettingsModal,
  LeaveHouseholdModal,
  DeleteHouseholdModal,
  HouseholdTabBar,
  HouseholdFooterDock,
  OverviewVitalsTab,
  FairnessLedgerTab,
  RosterGovernanceTab,
  InvitesNetworksTab,
  DepartureAuditTab,
} from '@/components/households';
import type { HouseholdTabId } from '@/components/households';

export default function Households() {
  const {
    households,
    activeHousehold,
    switchActiveHousehold,
    householdMembers,
    isLoading,
  } = useHousehold();

  // Tab state (Stitch 5-tab contextual disclosure)
  const [activeTab, setActiveTab] = useState<HouseholdTabId>('tab-vitals');

  // Modal & Drawer controller states
  const [isCreateJoinOpen, setIsCreateJoinOpen] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'create' | 'join'>('create');
  const [showOtherSpaces, setShowOtherSpaces] = useState(false);

  const [inviteHousehold, setInviteHousehold] = useState<HouseholdResponse | null>(null);
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

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-6">
        <CurrentSpaceHeroSkeleton />
      </div>
    );
  }

  if (households.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8">
        <HouseholdEmptyState
          onCreateClick={openCreateModal}
          onJoinClick={openJoinModal}
        />
        <CreateJoinModal
          open={isCreateJoinOpen}
          defaultTab={activeModalTab}
          onOpenChange={setIsCreateJoinOpen}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300 pb-12 select-none">
      {/* 1. TOP HERO / HOUSEHOLD IDENTITY BLOCK */}
      {currentHousehold && (
        <CurrentSpaceHeroCard
          household={currentHousehold}
          members={householdMembers}
          onOpenInvite={() => setInviteHousehold(currentHousehold)}
          onOpenSettings={() => setEditHousehold(currentHousehold)}
        />
      )}

      {/* 2. 5-TAB SEGMENTED CONTEXTUAL DISCLOSURE BAR */}
      <HouseholdTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* 3. ACTIVE TAB PANEL CONTENT */}
      <div className="w-full">
        {activeTab === 'tab-vitals' && (
          <OverviewVitalsTab
            onNavigateTab={(tab) => setActiveTab(tab as HouseholdTabId)}
            onOpenSettleModal={() => setActiveTab('tab-fairness')}
          />
        )}

        {activeTab === 'tab-fairness' && (
          <FairnessLedgerTab
            onRecordBill={() => {}}
          />
        )}

        {activeTab === 'tab-roster' && (
          <RosterGovernanceTab />
        )}

        {activeTab === 'tab-invites' && (
          <InvitesNetworksTab />
        )}

        {activeTab === 'tab-offboarding' && (
          <DepartureAuditTab
            onOpenLeaveModal={() => setLeaveHousehold(currentHousehold)}
            onOpenDeleteModal={() => setDeleteHousehold(currentHousehold)}
          />
        )}
      </div>

      {/* 4. OTHER SPACES DRAWER / COLLAPSIBLE ACCORDION */}
      {otherHouseholds.length > 0 && (
        <div className="bg-card rounded-2xl p-5 border border-border space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-surface-container text-foreground flex items-center justify-center">
                <Building2 className="w-4 h-4 stroke-[2.2]" />
              </div>
              <h3 className="font-bold text-xs font-mono uppercase tracking-wider text-foreground">
                Your Other Living Spaces ({otherHouseholds.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setShowOtherSpaces((prev) => !prev)}
              className="text-xs text-primary font-bold hover:underline flex items-center gap-1 cursor-pointer min-h-[44px]"
            >
              <span>{showOtherSpaces ? 'Hide Spaces' : 'View Spaces'}</span>
              {showOtherSpaces ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showOtherSpaces && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t border-border/60">
              {otherHouseholds.map((h) => (
                <OtherSpaceCard
                  key={h.householdId}
                  household={h}
                  onSwitch={() => switchActiveHousehold(h.householdId)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. STICKY HOUSEHOLD FOOTER DOCK */}
      <HouseholdFooterDock
        onSelectTab={(tab) => setActiveTab(tab)}
      />

      {/* MODALS */}
      {inviteHousehold && (
        <InviteRoommatesModal
          open={!!inviteHousehold}
          household={inviteHousehold}
          onOpenChange={(open) => {
            if (!open) setInviteHousehold(null);
          }}
        />
      )}

      <CreateJoinModal
        open={isCreateJoinOpen}
        defaultTab={activeModalTab}
        onOpenChange={setIsCreateJoinOpen}
      />

      {editHousehold && (
        <HouseholdSettingsModal
          open={!!editHousehold}
          household={editHousehold}
          onOpenChange={(open) => {
            if (!open) setEditHousehold(null);
          }}
        />
      )}

      {leaveHousehold && (
        <LeaveHouseholdModal
          open={!!leaveHousehold}
          household={leaveHousehold}
          onOpenChange={(open) => {
            if (!open) setLeaveHousehold(null);
          }}
        />
      )}

      {deleteHousehold && (
        <DeleteHouseholdModal
          open={!!deleteHousehold}
          household={deleteHousehold}
          onOpenChange={(open) => {
            if (!open) setDeleteHousehold(null);
          }}
        />
      )}
    </div>
  );
}
