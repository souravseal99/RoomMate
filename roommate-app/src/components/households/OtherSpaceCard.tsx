import { ArrowRightLeft, Users } from 'lucide-react';
import { getInitials } from '@/utils/utils';
import type { HouseholdResponse } from '@/types/householdTypes';

interface OtherSpaceCardProps {
  household: HouseholdResponse;
  onSwitch: () => void;
  onOpenRoster?: () => void;
}

export function OtherSpaceCard({
  household,
  onSwitch,
}: OtherSpaceCardProps) {
  const initial = (household.name.trim()[0] || 'H').toUpperCase();
  const members = household.members || [];
  const memberCount = members.length;

  return (
    <div
      onClick={onSwitch}
      className="bg-surface-container rounded-2xl p-4 flex items-center justify-between group hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer border border-border/60 hover:border-primary/40"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Monogram Badge */}
        <div className="w-12 h-12 bg-surface-container-high text-primary rounded-xl flex items-center justify-center font-extrabold text-xl shadow-xs shrink-0 border border-border/40">
          {initial}
        </div>

        {/* Space Info */}
        <div className="space-y-1 min-w-0">
          <h4 className="text-base font-bold text-foreground leading-tight truncate">
            {household.name}
          </h4>

          {/* Mini Avatar Stack */}
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              {members.slice(0, 2).map((member, idx) => {
                const name = member.user?.name || 'Roommate';
                const avatar = member.user?.avatarUrl;
                return avatar ? (
                  <img
                    key={idx}
                    src={avatar}
                    alt={name}
                    className="w-5 h-5 rounded-full object-cover border border-surface-container"
                  />
                ) : (
                  <div
                    key={idx}
                    className="w-5 h-5 rounded-full bg-surface border border-surface-container flex items-center justify-center text-[8px] font-bold text-foreground"
                  >
                    {getInitials(name)}
                  </div>
                );
              })}
              {memberCount > 2 && (
                <div className="w-5 h-5 rounded-full bg-surface-container-high border border-surface-container flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                  +{memberCount - 2}
                </div>
              )}
            </div>

            <span className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
              <Users className="w-3 h-3 text-muted-foreground" />
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Switch Button */}
      <button
        type="button"
        title="Switch to this Space"
        className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground bg-surface group-hover:bg-primary/10 group-hover:text-primary transition-colors border border-border shadow-xs shrink-0 active:scale-95 cursor-pointer ml-3"
      >
        <ArrowRightLeft className="w-4 h-4" />
      </button>
    </div>
  );
}
