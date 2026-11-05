import { Home, Sparkles } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';

export function SidebarBrand() {
  const { activeHousehold, hasActiveHousehold } = useHousehold();

  return (
    <div className="flex flex-col items-start mb-6 px-1">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-11 h-11 bg-sidebar-primary text-sidebar-primary-foreground rounded-xl flex items-center justify-center shadow-xs border-b-2 border-primary-fixed-dim shrink-0 active:scale-95 transition-transform">
          <Home className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl font-extrabold tracking-tight text-sidebar-foreground font-display leading-tight">
            RoomMate
          </h1>
          <span className="text-[10px] font-bold text-sidebar-muted tracking-[0.16em] uppercase font-mono">
            Bento Home Hub
          </span>
        </div>
      </div>

      {hasActiveHousehold && activeHousehold?.name && (
        <div className="mt-2 w-full px-3 py-1.5 rounded-lg bg-sidebar-accent border border-sidebar-border/80 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-phosphor animate-pulse" />
          <span className="text-xs font-semibold text-sidebar-foreground truncate">
            {activeHousehold.name}
          </span>
        </div>
      )}
      {!hasActiveHousehold && (
        <div className="mt-2 w-full px-3 py-1.5 rounded-lg bg-sidebar-accent/50 border border-sidebar-border/40 flex items-center gap-1.5 text-sidebar-muted">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
          <span className="text-xs font-medium truncate">No Active Space</span>
        </div>
      )}
    </div>
  );
}
