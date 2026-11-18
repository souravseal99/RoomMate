import { useState } from 'react';
import {
  User,
  Shield,
  Home,
  CheckCircle2,
  KeyRound,
  Trash2,
  Edit2,
  Calendar,
  Sparkles,
  AlertTriangle,
  LogOut,
  Laptop,
  Check,
} from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useHousehold from '@/hooks/useHousehold';
import {
  useProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useSessionsQuery,
  useRevokeOtherSessionsMutation,
  useDeleteAccountMutation,
} from '@/hooks/queries/useProfileQueries';
import { getInitials } from '@/utils/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { toast } from 'sonner';

export default function Profile() {
  const { name: authName, email: authEmail } = useAuth();
  const { activeHousehold, switchActiveHousehold } = useHousehold();
  const activeHouseholdId = activeHousehold?.householdId || '';

  // Queries & Mutations
  const { data: profile, isLoading } = useProfileQuery();
  const { data: sessions = [] } = useSessionsQuery();
  const updateProfileMutation = useUpdateProfileMutation();
  const changePasswordMutation = useChangePasswordMutation();
  const revokeOtherSessionsMutation = useRevokeOtherSessionsMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  // Edit Profile Dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Delete Account Confirmation state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');

  const displayName = profile?.name || authName || 'Roommate';
  const displayEmail = profile?.email || authEmail || '';
  const initials = getInitials(displayName);
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : 'Recently';

  const handleOpenEdit = () => {
    setEditName(displayName);
    setIsEditDialogOpen(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = editName.trim();
    if (trimmed.length < 2) {
      toast.error('Name must be at least 2 characters long');
      return;
    }
    await updateProfileMutation.mutateAsync({ name: trimmed });
    setIsEditDialogOpen(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      // Handled in mutation
    }
  };

  const handleDeleteAccountConfirm = async () => {
    if (deleteConfirmationText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    try {
      await deleteAccountMutation.mutateAsync();
    } catch {
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6 py-8 animate-pulse">
        <div className="h-44 w-full rounded-3xl bg-surface-container" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 h-80 rounded-3xl bg-surface-container" />
          <div className="lg:col-span-6 h-80 rounded-3xl bg-surface-container" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-28 animate-in fade-in duration-300">
      {/* 1. Header Hero Card */}
      <Card className="rounded-3xl p-6 sm:p-8 bg-card border-border shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex items-center gap-5 min-w-0">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center font-display font-extrabold text-2xl sm:text-3xl shadow-md border-2 border-primary/20">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-card flex items-center justify-center shadow-xs">
              <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
            </div>
          </div>

          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="font-display font-black text-2xl sm:text-3xl text-foreground tracking-tight truncate">
                {displayName}
              </h1>
              <Badge
                variant="outline"
                className="bg-primary/10 text-primary border-primary/20 text-xs font-bold px-2.5 py-0.5 rounded-full"
              >
                Verified Flatmate
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground truncate font-medium">{displayEmail}</p>

            <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Member since {joinedDate}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Good Standing</span>
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleOpenEdit}
          className="min-h-[44px] px-5 rounded-2xl bg-surface-container hover:bg-surface-container-high text-foreground font-bold text-xs sm:text-sm border border-border shadow-2xs transition-all cursor-pointer active:scale-95 flex items-center gap-2 shrink-0 self-start md:self-center"
        >
          <Edit2 className="w-4 h-4 text-primary" />
          <span>Edit Profile</span>
        </Button>
      </Card>

      {/* 2. Co-Living Reputation & Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl p-4 bg-card border-border shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Chores Done</span>
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-display">
              {profile?.stats?.choresCompleted ?? 0}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Verified</span>
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card border-border shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Home className="w-4 h-4 text-primary" />
            <span>Active Spaces</span>
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-foreground font-display">
              {profile?.stats?.spacesCount ?? profile?.households?.length ?? 1}
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Households</span>
          </div>
        </Card>

        <Card className="rounded-2xl p-4 bg-card border-border shadow-2xs flex flex-col justify-between col-span-2 sm:col-span-1">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-primary" />
            <span>Reputation</span>
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-primary font-display">100%</span>
            <span className="text-xs font-semibold text-primary">Reliable</span>
          </div>
        </Card>
      </div>

      {/* 3. 2-Column Bento Split: Household Spaces (Left) vs Security & Sessions (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Household Affiliations (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Home className="w-4 h-4 stroke-[2.2]" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-base text-foreground">
                    Household Affiliations
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Shared spaces you currently belong to
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="bg-surface-container text-foreground text-xs font-semibold px-2.5 py-0.5 rounded-full"
              >
                {profile?.households?.length ?? 0} Spaces
              </Badge>
            </div>

            <div className="space-y-3 pt-1">
              {!profile?.households || profile.households.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground text-xs bg-surface-container/30 rounded-2xl border border-dashed border-border/60">
                  You are not a member of any household yet.
                </div>
              ) : (
                profile.households.map((h) => {
                  const isActive = h.householdId === activeHouseholdId;
                  return (
                    <div
                      key={h.householdId}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-primary/10 border-primary/40 shadow-2xs'
                          : 'bg-surface-container-low border-border/60 hover:border-border'
                      }`}
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-sm text-foreground truncate">
                            {h.name}
                          </h3>
                          {isActive && (
                            <Badge
                              variant="default"
                              className="bg-primary text-primary-foreground text-[10px] font-extrabold uppercase px-2 py-0.2 rounded-full"
                            >
                              Active
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge
                            variant="secondary"
                            className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded-md"
                          >
                            {h.role}
                          </Badge>
                          <span>•</span>
                          <span>{h.memberCount} flatmates</span>
                        </div>
                      </div>

                      {!isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => switchActiveHousehold(h.householdId)}
                          className="min-h-[44px] px-3.5 rounded-xl bg-card hover:bg-surface-container text-foreground font-semibold text-xs border-border cursor-pointer active:scale-95 transition-all"
                        >
                          Switch Space
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right: Security, Sessions & Danger Zone (6 cols) */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Password Management */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 border-b border-border/50 pb-3">
              <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4 stroke-[2.2]" />
              </span>
              <div>
                <h2 className="font-display font-bold text-base text-foreground">
                  Change Password
                </h2>
                <p className="text-xs text-muted-foreground">
                  Update your credentials for secure flatmate access
                </p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3.5 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-bold text-foreground">
                  Current Password
                </Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-bold text-foreground">
                    New Password
                  </Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 8 characters"
                    className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-bold text-foreground">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    className="min-h-[44px] bg-surface-container border-border rounded-xl text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={changePasswordMutation.isPending || !currentPassword || !newPassword}
                className="w-full min-h-[44px] rounded-xl font-bold text-xs sm:text-sm mt-2 transition-all cursor-pointer active:scale-95"
              >
                {changePasswordMutation.isPending ? 'Updating Password...' : 'Save New Password'}
              </Button>
            </form>
          </Card>

          {/* Active Device Sessions */}
          <Card className="rounded-3xl p-6 bg-card border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Laptop className="w-4 h-4 stroke-[2.2]" />
                </span>
                <div>
                  <h2 className="font-display font-bold text-base text-foreground">
                    Active Sessions
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Devices authenticated with your account
                  </p>
                </div>
              </div>

              {sessions.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => revokeOtherSessionsMutation.mutate()}
                  disabled={revokeOtherSessionsMutation.isPending}
                  className="min-h-[36px] px-3 rounded-lg text-xs font-semibold text-destructive hover:bg-destructive/10 border-border cursor-pointer active:scale-95"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  Sign Out Other
                </Button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              {sessions.length === 0 ? (
                <div className="p-4 rounded-xl bg-surface-container text-xs text-muted-foreground text-center">
                  1 Active Device Session
                </div>
              ) : (
                sessions.map((s, idx) => (
                  <div
                    key={s.sessionId}
                    className="p-3 rounded-xl bg-surface-container-low border border-border/50 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Laptop className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="font-semibold text-foreground">
                          {idx === 0 ? 'Current Browser Session' : 'Active Session'}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Logged in {new Date(s.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {idx === 0 && (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px] font-bold"
                      >
                        Active Now
                      </Badge>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Danger Zone: Account Deletion */}
          <Card className="rounded-3xl p-6 bg-card border-destructive/30 shadow-xs space-y-3">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h2 className="font-display font-bold text-base">Danger Zone</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Permanently delete your user profile and remove your access from shared living spaces.
              This action cannot be undone.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setDeleteConfirmationText('');
                setIsDeleteDialogOpen(true);
              }}
              className="min-h-[44px] px-4 rounded-xl border-destructive/40 text-destructive hover:bg-destructive/10 text-xs font-bold transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Account
            </Button>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[420px] bg-card text-card-foreground border-border rounded-3xl p-6 shadow-2xl">
          <DialogHeader className="text-left space-y-1">
            <DialogTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              Edit Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update your display name visible to flatmates across all households.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="editName" className="text-xs font-bold text-foreground">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="editName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="min-h-[44px] bg-surface-container border-border rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Email Address</Label>
              <Input
                disabled
                value={displayEmail}
                className="min-h-[44px] bg-surface-container-low border-border/50 rounded-xl text-xs text-muted-foreground cursor-not-allowed"
              />
              <p className="text-[11px] text-muted-foreground italic">
                Email is tied to your login credentials and cannot be edited directly.
              </p>
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                className="min-h-[44px] px-4 rounded-xl text-xs font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateProfileMutation.isPending || !editName.trim()}
                className="min-h-[44px] px-5 rounded-xl text-xs font-bold"
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="sm:max-w-[420px] bg-card text-card-foreground border-destructive/30 rounded-3xl p-6 shadow-2xl">
          <AlertDialogHeader className="text-left space-y-2">
            <AlertDialogTitle className="text-lg font-bold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirm Account Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-muted-foreground space-y-2">
              <p>This will permanently delete your account, session tokens, and memberships.</p>
              <p className="font-semibold text-foreground">
                Type <span className="font-mono text-destructive">DELETE</span> to confirm:
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-2">
            <Input
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="min-h-[44px] bg-surface-container border-border rounded-xl text-sm text-center font-mono font-bold"
            />
          </div>

          <AlertDialogFooter className="flex items-center justify-end gap-2">
            <AlertDialogCancel className="min-h-[44px] px-4 rounded-xl text-xs font-semibold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccountConfirm}
              disabled={deleteConfirmationText !== 'DELETE' || deleteAccountMutation.isPending}
              className="min-h-[44px] px-5 rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground font-bold text-xs disabled:opacity-50"
            >
              {deleteAccountMutation.isPending ? 'Deleting...' : 'Delete My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
