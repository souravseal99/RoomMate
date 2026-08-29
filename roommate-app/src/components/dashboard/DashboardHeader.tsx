import { Home, Users, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import useHousehold from '@/hooks/useHousehold';

export default function DashboardHeader() {
  const navigate = useNavigate();
  const { activeHousehold, selectedHousehold, households } = useHousehold();

  const householdName = activeHousehold?.name || selectedHousehold?.value || 'My Household';
  const memberCount = activeHousehold?.members?.length ?? selectedHousehold?.memberCount ?? 1;

  return (
    <header className="flex items-center justify-between gap-4 py-2">
      {/* Left: Household Info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
          <Home className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-extrabold tracking-tight text-foreground truncate">
            {householdName}
          </h1>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {memberCount} Roommate{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        {households && households.length > 1 && (
          <Button
            type="button"
            size="sm"
            onClick={() => navigate('/households')}
            className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-foreground text-background hover:bg-foreground/90 active:scale-95 transition-all cursor-pointer"
          >
            Switch
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="w-10 h-10 rounded-full bg-card border-border hover:bg-surface-container active:scale-95 transition-all cursor-pointer text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </Button>
      </div>
    </header>
  );
}
