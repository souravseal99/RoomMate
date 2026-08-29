import { Home, ArrowRight, Plus, Check } from 'lucide-react';
import type { HouseholdResponse } from '@/types/householdTypes';
import { Button } from '@/components/ui/button';

type Props = {
  households: HouseholdResponse[];
  activeHouseholdId?: string;
  onSwitch: (householdId: string) => void;
  onOpenCreateJoin: () => void;
};

export default function ProfileSpacesGrid({
  households,
  activeHouseholdId,
  onSwitch,
  onOpenCreateJoin,
}: Props) {
  return (
    <section className="max-w-2xl mx-auto w-full space-y-3">
      <div className="flex items-center justify-between border-b border-border/60 pb-2">
        <h3 className="text-sm sm:text-base font-extrabold text-foreground">
          Your Shared Spaces
        </h3>
        <span className="text-xs font-bold text-muted-foreground">
          {households.length} {households.length === 1 ? 'Space' : 'Spaces'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {households.map((space) => {
          const isActive = space.householdId === activeHouseholdId;
          const isAdmin = space.role === 'ADMIN';

          return (
            <div
              key={space.householdId}
              onClick={() => onSwitch(space.householdId)}
              className={`bg-card rounded-2xl p-4 flex items-center justify-between border shadow-2xs transition-all cursor-pointer group ${
                isActive
                  ? 'border-primary/60 bg-primary/5'
                  : 'border-border hover:border-primary/40 hover:bg-surface-container/50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-container text-foreground'
                  }`}
                >
                  <Home className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-foreground truncate">
                    {space.name}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] uppercase font-black tracking-wider border ${
                        isAdmin
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : 'bg-surface-container text-muted-foreground border-border'
                      }`}
                    >
                      {isAdmin ? 'Admin' : 'Member'}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-bold text-primary flex items-center gap-0.5">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={`text-xs font-bold flex items-center gap-1 transition-colors shrink-0 ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground group-hover:text-primary'
                }`}
              >
                <span>{isActive ? 'Current' : 'Switch'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={onOpenCreateJoin}
        className="w-full border-dashed border-border hover:border-primary/50 text-foreground font-bold py-3 rounded-2xl flex items-center justify-center gap-2 text-xs sm:text-sm bg-card/60 hover:bg-surface-container cursor-pointer mt-2"
      >
        <Plus className="w-4 h-4 text-primary" />
        <span>Join or Create a New Space</span>
      </Button>
    </section>
  );
}
