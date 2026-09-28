import { ShieldCheck, BadgeCheck, Sparkles, Volume2, Shield } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';

export function RosterGovernanceTab() {
  const { householdMembers } = useHousehold();

  // Static/Fallback flatmates enhanced with Stitch attributes
  const flatmates = [
    {
      initials: 'SS',
      name: householdMembers?.[0]?.user?.name || 'Sourav Seal',
      role: 'Host Admin',
      room: 'Room A (Master Suite) • Joined Jun 2024',
      karma: 420,
      dutiesDone: 24,
      tag: 'Current Lead',
      icon: ShieldCheck,
      color: 'bg-primary text-primary-foreground',
    },
    {
      initials: 'AC',
      name: householdMembers?.[1]?.user?.name || 'Alex Chen',
      role: 'Supply Steward',
      room: 'Room B • Joined Jun 2024',
      karma: 380,
      dutiesDone: 21,
      tag: 'Inventory Admin',
      icon: BadgeCheck,
      color: 'bg-secondary text-secondary-foreground',
    },
    {
      initials: 'SL',
      name: householdMembers?.[2]?.user?.name || 'Sarah Lin',
      role: 'Social Lead',
      room: 'Room C • Joined Jul 2024',
      karma: 315,
      dutiesDone: 19,
      tag: 'Bulletin Curator',
      icon: Sparkles,
      color: 'bg-tertiary text-tertiary-foreground',
    },
    {
      initials: 'LK',
      name: householdMembers?.[3]?.user?.name || 'Leo Keller',
      role: 'Quiet Hours Lead',
      room: 'Room D • Joined Aug 2024',
      karma: 290,
      dutiesDone: 16,
      tag: 'Sound & Climate',
      icon: Volume2,
      color: 'bg-muted-foreground text-background',
    },
  ];

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-bold text-lg text-foreground font-display tracking-tight">
            Flatmate Roster &amp; Governance
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active leaseholders, chore weight distribution, and primary household roles.
          </p>
        </div>
        <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase self-start">
          {flatmates.length} / 4 Slots Filled
        </span>
      </div>

      {/* Flatmate Cards Grid (2 cols on desktop) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {flatmates.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.initials}
              className="bg-surface-container p-4 rounded-xl border border-border/80 flex flex-col gap-3 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center font-bold text-sm font-mono shrink-0 shadow-xs`}
                  >
                    {f.initials}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-foreground tracking-tight">
                        {f.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono text-[9px] font-bold uppercase">
                        {f.role}
                      </span>
                    </div>
                    <span className="text-[11px] text-muted-foreground truncate mt-0.5">
                      {f.room}
                    </span>
                  </div>
                </div>
                <Icon className="w-4 h-4 text-primary shrink-0 ml-1" />
              </div>

              <div className="flex items-center justify-between bg-card p-2.5 rounded-lg text-xs border border-border/60">
                <span className="text-muted-foreground">
                  Karma Points: <strong className="text-foreground font-mono">{f.karma}</strong>
                </span>
                <span className="text-muted-foreground">
                  Duties Done:{' '}
                  <strong className="text-foreground font-mono">{f.dutiesDone}</strong>
                </span>
                <span className="text-primary font-bold font-mono text-[11px]">{f.tag}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Governance Consensus Protocol */}
      <div className="bg-surface-container-low border border-border p-4 rounded-xl flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center shrink-0 mt-0.5">
          <Shield className="w-4 h-4" />
        </div>
        <div className="flex flex-col gap-1">
          <span className="font-bold text-xs text-foreground font-display">
            Governance Consensus Protocol
          </span>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Our household operates under a simple 3/4 supermajority consensus rule for lease
            renewals, guest policy amendments, and communal appliance asset replacements exceeding
            $200.
          </p>
        </div>
      </div>
    </div>
  );
}

export default RosterGovernanceTab;
