import { useState } from 'react';
import {
  Users,
  Copy,
  Check,
  MessageCircle,
  Link as LinkIcon,
  MoreVertical,
  LogOut,
  UserPlus,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHouseholdMembersQuery, useSuggestedMembersQuery } from '@/hooks/queries/useHouseholdQueries';
import useAuth from '@/hooks/useAuth';
import { getInitials } from '@/utils/utils';
import { toast } from 'sonner';
import type { HouseholdResponse, HouseholdMember } from '@/types/householdTypes';

interface MemberRosterViewProps {
  household: HouseholdResponse | null;
  onBack?: () => void;
  onOpenSettings?: () => void;
  onOpenLeave?: () => void;
}

export function MemberRosterView({
  household,
  onBack,
  onOpenSettings,
  onOpenLeave,
}: MemberRosterViewProps) {
  const { email: currentUserEmail } = useAuth();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const { data: members = [], isLoading: isMembersLoading } = useHouseholdMembersQuery(
    household?.householdId
  );

  const { data: suggestedMembers = [] } = useSuggestedMembersQuery();

  if (!household) return null;

  const displayMembers: HouseholdMember[] =
    members.length > 0 ? members : household.members || [];

  const inviteCode = household.inviteCode || '';
  const joinUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/join?code=${inviteCode}`
      : `https://roommate.app/join?code=${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Could not copy code.');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      toast.success('Direct invite link copied!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Join our shared living space "${household.name}" on RoomMate 🏠\n\nInvite Code: ${inviteCode}\nDirect Link: ${joinUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${household.name} on RoomMate`,
          text: `Use invite code ${inviteCode} to join our household!`,
          url: joinUrl,
        });
      } catch {
        handleWhatsAppShare();
      }
    } else {
      handleWhatsAppShare();
    }
  };

  // Format joined date
  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return 'Joined recently';
    try {
      const date = new Date(dateStr);
      return `Joined: ${date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })}`;
    } catch {
      return 'Joined recently';
    }
  };

  // Filter out users already in this household from suggested
  const existingUserIds = new Set(displayMembers.map((m) => m.userId || m.user?.userId));
  const filteredSuggestions = suggestedMembers.filter((sm) => !existingUserIds.has(sm.userId));

  return (
    <div className="w-full flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface-container transition-colors cursor-pointer active:scale-95"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Roommates
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {household.name} • {displayMembers.length} {displayMembers.length === 1 ? 'member' : 'members'}
            </p>
          </div>
        </div>

        {onOpenSettings && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenSettings}
            className="text-xs font-semibold h-8 border-border bg-surface-container-low hover:bg-surface-container cursor-pointer"
          >
            Settings
          </Button>
        )}
      </div>

      {/* Member Roster List */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
          Active Roster
        </span>

        {isMembersLoading ? (
          <div className="space-y-2.5">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-surface-container rounded-xl p-3.5 flex items-center justify-between border border-border/60"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-11 h-11 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
                <Skeleton className="w-8 h-8 rounded-full" />
              </div>
            ))}
          </div>
        ) : displayMembers.length > 0 ? (
          <div className="space-y-2.5">
            {displayMembers.map((member) => {
              const name = member.user?.name || 'Roommate';
              const email = member.user?.email || '';
              const avatarUrl = member.user?.avatarUrl;
              const isAdmin = member.role === 'ADMIN';
              const isSelf = member.user?.email === currentUserEmail && currentUserEmail != null;

              return (
                <div
                  key={member.householdMemberId || member.userId}
                  className="bg-surface-container hover:bg-surface-container-high rounded-xl p-3.5 flex items-center justify-between gap-3 border border-border/60 shadow-xs hover:-translate-y-0.5 transition-all group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar */}
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="w-11 h-11 rounded-full object-cover border border-border shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-sm text-foreground shadow-xs shrink-0">
                        {getInitials(name)}
                      </div>
                    )}

                    {/* Member Info */}
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-foreground truncate">
                          {name}
                        </span>
                        {isSelf && (
                          <span className="text-[10px] font-semibold text-muted-foreground">
                            (You)
                          </span>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${isAdmin
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : 'bg-surface-container-highest text-muted-foreground border border-border/40'
                            }`}
                        >
                          {member.role}
                        </span>
                      </div>

                      {email && (
                        <p className="text-xs text-muted-foreground truncate">{email}</p>
                      )}
                      <p className="text-[11px] text-muted-foreground/80">
                        {formatJoinedDate(member.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Actions Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-surface transition-colors cursor-pointer active:scale-95 shrink-0"
                        aria-label="Member options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-44 bg-card text-foreground border-border">
                      {isSelf && onOpenLeave && (
                        <DropdownMenuItem
                          onClick={onOpenLeave}
                          className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive gap-2 text-xs font-semibold"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Leave Space
                        </DropdownMenuItem>
                      )}
                      {!isSelf && (
                        <DropdownMenuItem
                          onClick={() => {
                            navigator.clipboard.writeText(email);
                            toast.success(`Copied ${name}'s email`);
                          }}
                          className="cursor-pointer gap-2 text-xs font-semibold"
                        >
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                          Copy Email
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-surface-container rounded-xl p-6 text-center text-xs text-muted-foreground border border-border">
            No flatmates listed in this space yet.
          </div>
        )}
      </div>

      {/* Suggested Flatmates from Other Spaces */}
      {filteredSuggestions.length > 0 && (
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center gap-1.5 ml-1">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              Suggested Roommates (From Other Spaces)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {filteredSuggestions.slice(0, 4).map((suggested) => (
              <div
                key={suggested.userId}
                className="bg-surface-container-low rounded-xl p-2.5 flex items-center justify-between border border-border/50 shadow-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center font-bold text-xs text-foreground shrink-0">
                    {getInitials(suggested.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground truncate leading-tight">
                      {suggested.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {suggested.sharedHouseholds[0]}
                    </p>
                  </div>
                </div>

                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-7 text-[10px] font-bold px-2 border-border bg-surface hover:bg-surface-container shrink-0 cursor-pointer"
                >
                  Share Code
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tactile Sticky Note Invite Card (Stitch Design) */}
      <section className="relative mt-2">
        <div className="bg-surface-paper p-5 sm:p-6 rounded-2xl shadow-md border border-outline-variant/40 relative overflow-hidden">
          {/* Subtle tape accent top indicator */}
          <div className="w-16 h-2 bg-primary/20 rounded-full mx-auto mb-3" />

          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <UserPlus className="w-6 h-6 stroke-[2.2]" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-foreground tracking-tight">
                Invite Roommates
              </h3>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                Share this code with your housemates to let them join '{household.name}'.
              </p>
            </div>

            {/* Invite Code Block */}
            <div className="w-full bg-surface-variant/80 rounded-xl p-3 flex items-center justify-between border border-border/70">
              <span className="text-xl sm:text-2xl font-black tracking-widest text-primary font-mono select-all pl-2">
                {inviteCode}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 rounded-lg hover:bg-surface-container text-foreground transition-colors flex items-center gap-1 cursor-pointer active:scale-95"
                title="Copy Invite Code"
              >
                {copiedCode ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4 text-muted-foreground" />
                )}
              </button>
            </div>

            {/* Share Actions */}
            <div className="grid grid-cols-2 gap-2.5 w-full pt-1">
              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="h-10 text-xs font-bold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-xl shadow-xs"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-primary" /> : <LinkIcon className="w-3.5 h-3.5" />}
                Copy Link
              </Button>

              <Button
                onClick={handleNativeShare}
                className="h-10 text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-xl shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
