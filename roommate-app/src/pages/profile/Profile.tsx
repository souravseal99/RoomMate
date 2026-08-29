import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, Shield, Bell, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import useHousehold from '@/hooks/useHousehold';
import { useUserProfileQuery } from '@/hooks/queries/useUserQueries';
import {
  ProfileHeroCard,
  ReputationStatsRow,
  ProfileSpacesGrid,
  AccountSecuritySection,
  DangerZoneCard,
  EditProfileModal,
  ChangePasswordModal,
  ProfileSkeleton,
} from '@/components/profile';
import { CreateJoinModal } from '@/components/households';
import { toast } from 'sonner';

const LIVING_HABITS_STORAGE_KEY = 'roommate_living_habits';
const DEFAULT_HABITS =
  'Early riser, loves cooking large meals on Sundays, night owl on weekends. Always down to share groceries!';

export default function Profile() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useUserProfileQuery();
  const { households, activeHousehold, switchActiveHousehold } = useHousehold();

  // Living habits custom state persisted locally
  const [livingHabits, setLivingHabits] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(LIVING_HABITS_STORAGE_KEY) || DEFAULT_HABITS;
    }
    return DEFAULT_HABITS;
  });

  // Modal dialog states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isCreateJoinOpen, setIsCreateJoinOpen] = useState(false);
  const [isSessionsOpen, setIsSessionsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleSaveHabits = (newHabits: string) => {
    setLivingHabits(newHabits);
    localStorage.setItem(LIVING_HABITS_STORAGE_KEY, newHabits);
  };

  const handleSwitchSpace = (householdId: string) => {
    switchActiveHousehold(householdId);
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Top Header Ribbon */}
      <header className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-all cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground flex items-center gap-2 tracking-tight">
              <User className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              Profile &amp; Settings
            </h1>
          </div>
        </div>
      </header>

      {isLoading ? (
        <ProfileSkeleton />
      ) : (
        <div className="space-y-7">
          {/* 1. Hero Identity Card with Washi Tape Accent */}
          <ProfileHeroCard
            profile={profile}
            livingHabits={livingHabits}
            onEdit={() => setIsEditOpen(true)}
          />

          {/* 2. Reputation & Activity Stats (3 Bento Pills) */}
          <ReputationStatsRow
            choreStreak={12}
            reliableSettlerRate={100}
            activeSpacesCount={households.length}
          />

          {/* 3. Your Shared Spaces */}
          <ProfileSpacesGrid
            households={households}
            activeHouseholdId={activeHousehold?.householdId}
            onSwitch={handleSwitchSpace}
            onOpenCreateJoin={() => setIsCreateJoinOpen(true)}
          />

          {/* 4. Account & Security Controls */}
          <AccountSecuritySection
            onChangePassword={() => setIsPasswordOpen(true)}
            onOpenSessions={() => setIsSessionsOpen(true)}
            onOpenNotifications={() => setIsNotificationsOpen(true)}
          />

          {/* 5. Danger Zone */}
          <DangerZoneCard />
        </div>
      )}

      {/* Edit Profile Modal */}
      <EditProfileModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        profile={profile}
        livingHabits={livingHabits}
        onSaveHabits={handleSaveHabits}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        open={isPasswordOpen}
        onOpenChange={setIsPasswordOpen}
      />

      {/* Create / Join Space Modal */}
      <CreateJoinModal
        open={isCreateJoinOpen}
        onOpenChange={setIsCreateJoinOpen}
      />

      {/* Active Sessions Dialog */}
      <Dialog open={isSessionsOpen} onOpenChange={setIsSessionsOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md p-6 rounded-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Active Device Sessions
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Devices currently authenticated into your RoomMate account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between border border-border/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-foreground">Current Browser Session</h4>
                  <p className="text-[10px] text-muted-foreground">Chrome / macOS • Active now</p>
                </div>
              </div>
              <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                This Device
              </span>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={() => {
                toast.success('Logged out of all other remote device sessions.');
                setIsSessionsOpen(false);
              }}
              className="w-full font-bold text-xs rounded-xl mt-2 cursor-pointer"
            >
              Sign Out Everywhere Else
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Notification Settings Dialog */}
      <Dialog open={isNotificationsOpen} onOpenChange={setIsNotificationsOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md p-6 rounded-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notification Preferences
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Configure alert channels and roommate reminders.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2 divide-y divide-border/40 text-xs">
            <div className="pt-2 first:pt-0 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Chore Reminders</p>
                <p className="text-muted-foreground text-[11px]">24h and 2h before chore due dates</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
            </div>
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Expense Split Alerts</p>
                <p className="text-muted-foreground text-[11px]">When roommates add new expenses or settlements</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
            </div>
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-bold text-foreground">Low Pantry Stock Warnings</p>
                <p className="text-muted-foreground text-[11px]">When essential supplies run below minimums</p>
              </div>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="button"
              onClick={() => {
                toast.success('Notification preferences saved.');
                setIsNotificationsOpen(false);
              }}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl text-xs px-4"
            >
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
