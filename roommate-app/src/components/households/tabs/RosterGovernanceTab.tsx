import { useMemo } from 'react';
import { ShieldCheck, BadgeCheck, Shield, Users } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import { useHouseholdChoresQuery } from '@/hooks/queries/useChoreQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function RosterGovernanceTab() {
  const { activeHousehold, activeHouseholdId, householdMembers } = useHousehold();
  const { email, name: authName } = useAuth();
  const { data: chores = [] } = useHouseholdChoresQuery(activeHouseholdId);

  const targetRoommates = activeHousehold?.settings?.targetRoommates || 4;

  const membersWithStats = useMemo(() => {
    return householdMembers.map((member, index) => {
      const name = member.user?.name || member.user?.email || 'Roommate';
      const initials = name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();

      const isCurrentUser =
        (email && member.user?.email?.toLowerCase() === email.toLowerCase()) ||
        (authName && member.user?.name?.toLowerCase() === authName.toLowerCase());

      const dutiesDone = chores.filter(
        (c) => c.assignedToId === member.userId && c.completed
      ).length;

      const dutiesPending = chores.filter(
        (c) => c.assignedToId === member.userId && !c.completed
      ).length;

      const joinedText = member.createdAt
        ? `Joined ${new Date(member.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            year: 'numeric',
          })}`
        : 'Active Resident';

      const colorPalette = [
        'bg-primary text-primary-foreground',
        'bg-secondary text-secondary-foreground',
        'bg-tertiary text-tertiary-foreground',
        'bg-muted-foreground text-card',
      ];
      const color = colorPalette[index % colorPalette.length];

      return {
        memberId: member.householdMemberId,
        userId: member.userId,
        initials,
        name,
        role: member.role === 'ADMIN' ? 'Host Admin' : 'Resident',
        isAdmin: member.role === 'ADMIN',
        joinedText,
        dutiesDone,
        dutiesPending,
        isCurrentUser,
        color,
        icon: member.role === 'ADMIN' ? ShieldCheck : BadgeCheck,
      };
    });
  }, [householdMembers, chores, email, authName]);

  const supermajorityCount = Math.max(1, Math.ceil((householdMembers.length * 3) / 4));

  return (
    <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4 space-y-0">
        <div>
          <CardTitle className="font-bold text-lg text-foreground font-display tracking-tight">
            Flatmate Roster &amp; Governance
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Active leaseholders, chore distribution, and domestic governance consensus.
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1.5 rounded-full bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold uppercase self-start"
        >
          {householdMembers.length} / {targetRoommates} Slots Filled
        </Badge>
      </CardHeader>

      <CardContent className="p-0 flex flex-col gap-6">
        {/* Flatmate Cards Grid (2 cols on desktop) */}
        {membersWithStats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {membersWithStats.map((f) => {
              const Icon = f.icon;
              return (
                <Card
                  key={f.memberId}
                  className="bg-surface-container p-4 rounded-xl border-border/80 flex flex-col gap-3 hover:border-primary/40 transition-colors shadow-xs"
                >
                  <CardContent className="p-0 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="w-11 h-11 rounded-xl shrink-0 shadow-xs border border-border/40">
                          <AvatarFallback className={`rounded-xl ${f.color} font-bold text-sm font-mono`}>
                            {f.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs text-foreground tracking-tight truncate">
                              {f.name} {f.isCurrentUser ? '(You)' : ''}
                            </span>
                            <Badge
                              variant="outline"
                              className={`px-2 py-0.5 rounded-full font-mono text-[9px] font-bold uppercase ${
                                f.isAdmin
                                  ? 'bg-primary/10 text-primary border-primary/20'
                                  : 'bg-secondary/10 text-secondary border-secondary/20'
                              }`}
                            >
                              {f.role}
                            </Badge>
                          </div>
                          <span className="text-[11px] text-muted-foreground truncate mt-0.5 font-mono">
                            {f.joinedText}
                          </span>
                        </div>
                      </div>
                      <Icon className="w-4 h-4 text-primary shrink-0 ml-1" />
                    </div>

                    <div className="flex items-center justify-between bg-card p-2.5 rounded-lg text-xs border border-border/60">
                      <span className="text-muted-foreground">
                        Completed Duties: <strong className="text-foreground font-mono">{f.dutiesDone}</strong>
                      </span>
                      <span className="text-muted-foreground">
                        Pending: <strong className="text-foreground font-mono">{f.dutiesPending}</strong>
                      </span>
                      <span className="text-primary font-bold font-mono text-[11px]">
                        {f.isAdmin ? 'Primary Admin' : 'Resident'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-xs text-muted-foreground">
            <Users className="w-8 h-8 text-primary/60 mb-1" />
            <span className="font-bold text-foreground">No Registered Roster</span>
            <span className="text-[11px] font-mono">Invite roommates to start tracking duties.</span>
          </div>
        )}

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
              {activeHousehold?.name || 'This household'} operates under a supermajority consensus rule ({supermajorityCount} of {householdMembers.length || 1} members) for lease agreements, house policy updates, and communal asset expenditures.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default RosterGovernanceTab;

