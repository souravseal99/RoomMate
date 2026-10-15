import useHousehold from '@/hooks/useHousehold';

export function AppFooter() {
  const { activeHousehold, hasActiveHousehold } = useHousehold();
  const spaceName = hasActiveHousehold
    ? activeHousehold?.name || 'Active Household'
    : 'RoomMate Space';

  return (
    <footer className="w-full bg-surface-container-lowest border-t border-border/40 mt-auto shadow-xs text-muted-foreground transition-colors">
      <div className="max-w-[1520px] mx-auto px-4 md:px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left text-xs">
        {/* Left House OS Motto & Household Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <span className="font-extrabold text-foreground tracking-tight">
            RoomMate House OS
          </span>
          <span className="hidden sm:inline text-muted-foreground/60">•</span>
          <span>Shared living with mutual calm &amp; zero guilt</span>
          <span className="hidden sm:inline text-muted-foreground/60">•</span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-full border border-primary/20">
            {spaceName}
          </span>
        </div>

        {/* Right Charter & Policy Links */}
        <nav
          aria-label="Household Policies"
          className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold"
        >
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Quiet Hours Policy
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Duty Swap Rules
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Fair-Share Charter
          </button>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-primary transition-colors cursor-pointer"
          >
            Household Vault
          </button>
        </nav>
      </div>
    </footer>
  );
}
