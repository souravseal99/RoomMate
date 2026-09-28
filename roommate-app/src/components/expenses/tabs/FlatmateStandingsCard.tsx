import { useMemo } from 'react';
import type { BalanceEntry } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';

interface FlatmateStandingsCardProps {
  balances: BalanceEntry[];
  householdMembers: HouseholdMember[];
  currentUserId: string;
  onOpenSettleModal?: (target?: any) => void;
}

export function FlatmateStandingsCard({
  balances,
  householdMembers,
  currentUserId,
}: FlatmateStandingsCardProps) {
  // Map balances to members
  const memberStandings = useMemo(() => {
    return householdMembers.map((member) => {
      const entry = balances.find((b) => b.userId === member.userId);
      const balance = entry ? entry.balance : 0;
      const isCurrentUser = member.userId === currentUserId;

      let status = 'Settled';
      if (balance > 0.01) {
        status = 'Owed by flatmates';
      } else if (balance < -0.01) {
        status = 'Owes house';
      }

      return {
        userId: member.userId,
        name: member.user.name,
        balance,
        status,
        isCurrentUser,
      };
    });
  }, [householdMembers, balances, currentUserId]);

  return (
    <div className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border border-border flex flex-col gap-4 select-none">
      <div className="flex items-center justify-between pb-1 border-b border-border/40">
        <div>
          <h3 className="font-display font-extrabold text-lg text-foreground">
            Flatmate Standings
          </h3>
          <p className="text-xs text-muted-foreground">
            Net domestic balances across all open tabs
          </p>
        </div>
        <span className="px-2.5 py-1 bg-surface-container text-foreground font-mono text-[10px] font-bold uppercase rounded-lg border border-border/50">
          Unit 4B
        </span>
      </div>

      {/* Roster Balance Rows */}
      <div className="flex flex-col gap-2">
        {memberStandings.map((m) => {
          const isPositive = m.balance > 0.01;
          const isNegative = m.balance < -0.01;
          const initial = (m.name[0] || 'U').toUpperCase();

          return (
            <div
              key={m.userId}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                m.isCurrentUser
                  ? 'bg-primary/5 border-primary/30'
                  : 'bg-surface-container border-border/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-xs ${
                    m.isCurrentUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-surface-container-high text-foreground'
                  }`}
                >
                  {initial}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-foreground">
                      {m.name}
                    </span>
                    {m.isCurrentUser && (
                      <span className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10">
                        YOU
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground block">
                    {m.status}
                  </span>
                </div>
              </div>

              {/* Amount Chip */}
              <div
                className={`px-3 py-1 rounded-lg font-mono font-bold text-xs tabular-nums ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                    : isNegative
                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                    : 'bg-surface-container-high text-muted-foreground'
                }`}
              >
                {isPositive ? `+$${m.balance.toFixed(2)}` : isNegative ? `-$${Math.abs(m.balance).toFixed(2)}` : '$0.00'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
