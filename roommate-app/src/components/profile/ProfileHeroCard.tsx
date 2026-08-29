import { Edit3, BookOpen, User as UserIcon } from 'lucide-react';
import type { UserProfile } from '@/api/userApi';
import { getInitials } from '@/utils/utils';

type Props = {
  profile?: UserProfile;
  livingHabits?: string;
  onEdit: () => void;
};

export default function ProfileHeroCard({
  profile,
  livingHabits = 'Early riser, loves cooking large meals on Sundays, night owl on weekends. Always down to share groceries!',
  onEdit,
}: Props) {
  const userName = profile?.name || 'RoomMate Member';
  const userEmail = profile?.email || 'user@example.com';

  return (
    <section className="relative mx-auto w-full max-w-2xl mt-4">
      {/* Washi Tape Accent */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2 w-14 h-5 bg-card/70 border border-border/50 shadow-2xs backdrop-blur-xs rounded-xs rotate-[-1deg] z-20 pointer-events-none"
        aria-hidden="true"
      />

      {/* Tactile Sticky Note Card */}
      <div className="bg-card text-foreground rounded-2xl p-5 sm:p-7 shadow-sm border border-border transition-all hover:shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          {/* Avatar Container with Edit Badge */}
          <div className="relative shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-3xl sm:text-4xl font-extrabold border-4 border-card shadow-md">
              <span>{getInitials(userName)}</span>
            </div>
            <button
              type="button"
              onClick={onEdit}
              aria-label="Edit Profile"
              className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-2 shadow-sm hover:scale-110 active:scale-95 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>

          {/* User Details & Habits */}
          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight truncate">
                {userName}
              </h2>
              <button
                type="button"
                onClick={onEdit}
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 truncate">
              {userEmail}
            </p>

            {/* Living Habits Card */}
            <div className="bg-surface-container/60 rounded-xl p-3 sm:p-3.5 border border-border/60 text-left">
              <h3 className="text-xs font-extrabold text-foreground mb-1 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>Living Habits</span>
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground italic font-medium">
                "{livingHabits}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
