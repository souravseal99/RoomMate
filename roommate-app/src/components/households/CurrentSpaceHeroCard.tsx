import { Users, UserPlus, Settings } from 'lucide-react';
import { getInitials } from '@/utils/utils';
import type { HouseholdResponse, HouseholdMember } from '@/types/householdTypes';

interface CurrentSpaceHeroCardProps {
  household: HouseholdResponse;
  members: HouseholdMember[];
  onOpenRoster: () => void;
  onOpenInvite: () => void;
  onOpenSettings: () => void;
}

export function CurrentSpaceHeroCard({
  household,
  members,
  onOpenRoster,
  onOpenInvite,
  onOpenSettings,
}: CurrentSpaceHeroCardProps) {
  const displayMembers = members.length > 0 ? members : household.members || [];
  const maxVisibleAvatars = 4;
  const visibleMembers = displayMembers.slice(0, maxVisibleAvatars);
  const remainingCount = displayMembers.length - maxVisibleAvatars;

  return (
    <section className="space-y-3">
      <h2 className="text-xs font-bold text-muted-foreground uppercase tracking-widest ml-1">
        Current Space
      </h2>

      <div className="relative bg-surface-container rounded-2xl p-6 md:p-8 shadow-md border border-border/60 transition-all">
        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-primary/10 text-primary rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-primary/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Active Workspace
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-none">
              {household.name}
            </h3>
          </div>

          {/* Action Cluster */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onOpenRoster}
              title="View Flatmate Roster"
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-center text-foreground border border-border shadow-xs cursor-pointer active:scale-95"
            >
              <Users className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenInvite}
              title="Invite Roommates"
              className="w-10 h-10 rounded-full bg-primary/10 hover:bg-primary/20 transition-all flex items-center justify-center text-primary border border-primary/20 shadow-xs cursor-pointer active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenSettings}
              title="Space Settings & Actions"
              className="w-10 h-10 rounded-full bg-surface-container-low hover:bg-surface-container-high transition-all flex items-center justify-center text-foreground border border-border shadow-xs cursor-pointer active:scale-95"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Avatar & Meta Row */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-border/50">
          <div className="flex -space-x-3 hover:space-x-1 transition-all duration-300">
            {visibleMembers.map((member, idx) => {
              const name = member.user?.name || 'Roommate';
              const avatarUrl = member.user?.avatarUrl;

              return avatarUrl ? (
                <img
                  key={member.householdMemberId || member.userId || idx}
                  src={avatarUrl}
                  alt={name}
                  title={name}
                  className="w-10 h-10 rounded-full border-2 border-surface-container object-cover z-10 relative shadow-xs"
                />
              ) : (
                <div
                  key={member.householdMemberId || member.userId || idx}
                  title={name}
                  className="w-10 h-10 rounded-full border-2 border-surface-container bg-surface flex items-center justify-center text-xs font-bold text-foreground z-10 relative shadow-xs"
                >
                  {getInitials(name)}
                </div>
              );
            })}

            {remainingCount > 0 && (
              <div className="w-10 h-10 rounded-full border-2 border-surface-container bg-surface-container-high flex items-center justify-center text-xs font-bold text-muted-foreground z-0 relative shadow-xs">
                +{remainingCount}
              </div>
            )}
          </div>

          <span className="text-xs sm:text-sm font-semibold text-muted-foreground tracking-wide">
            {displayMembers.length} {displayMembers.length === 1 ? 'total member' : 'total members'}
          </span>
        </div>
      </div>
    </section>
  );
}
