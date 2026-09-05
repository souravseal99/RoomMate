import { useNavigate } from 'react-router-dom';
import { Home, Users, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useHousehold from '@/hooks/useHousehold';

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { activeHousehold, selectedHousehold } = useHousehold();

  const householdName = activeHousehold?.name || selectedHousehold?.value || '123 Maple Ave';
  const memberCount = activeHousehold?.members?.length ?? selectedHousehold?.memberCount ?? 4;

  return (
    <header className="flex items-center justify-between gap-4 py-2">
      {/* Left: Household Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary shadow-xs">
          <Home className="w-5 h-5 fill-primary/20 stroke-primary stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground truncate leading-tight">
            {householdName}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground mt-0.5">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {memberCount} Roommates
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2.5 shrink-0">
        <Button
          type="button"
          onClick={() => navigate('/households')}
          className="px-4 py-1.5 h-9 text-xs font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-95 shadow-sm transition-all cursor-pointer"
        >
          Switch
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-card border-border hover:bg-surface-container active:scale-95 transition-all cursor-pointer text-muted-foreground hover:text-foreground shadow-xs"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
