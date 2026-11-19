import { useMemo } from 'react';
import { Bell, Zap, Users } from 'lucide-react';
import type { BalanceEntry } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FlatmateStandingsCardProps {
  balances: BalanceEntry[];
  householdMembers: HouseholdMember[];
  currentUserId: string;
  onOpenSettleModal?: (target?: unknown) => void;
}

export function FlatmateStandingsCard({
  balances,
  householdMembers,
  currentUserId,
  onOpenSettleModal,
}: FlatmateStandingsCardProps) {
  // Map balances to members using balances as the primary source of truth
  const memberStandings = useMemo(() => {
    if (balances && balances.length > 0) {
      return balances.map((b) => {
        const matchingMember = householdMembers.find(
          (m) =>
            m.userId === b.userId ||
            m.user?.userId === b.userId ||
            m.householdMemberId === b.userId ||
            m.user?.name?.toLowerCase() === b.name?.toLowerCase()
        );
        const name = b.name || matchingMember?.user?.name || 'Roommate';
        const isCurrentUser =
          b.userId === currentUserId ||
          matchingMember?.userId === currentUserId ||
          matchingMember?.user?.userId === currentUserId;
        const balance = b.balance ?? 0;

        let status = 'Settled';
        if (balance > 0.01) {
          status = 'Owed by flatmates';
        } else if (balance < -0.01) {
          status = 'Owes house';
        }

        return {
          userId: b.userId,
          name,
          balance,
          status,
          isCurrentUser,
        };
      });
    }

    // Fallback if balances is not yet loaded but householdMembers is available
    return householdMembers.map((member) => {
      const memberUserId = member.userId || member.user?.userId || member.householdMemberId;
      const isCurrentUser = memberUserId === currentUserId;
      return {
        userId: memberUserId,
        name: member.user?.name || 'Roommate',
        balance: 0,
        status: 'Settled',
        isCurrentUser,
      };
    });
  }, [householdMembers, balances, currentUserId]);

  const handleNudge = (name: string, amount: number) => {
    const absAmount = Math.abs(amount).toFixed(2);
    toast.success(`Payment nudge sent to ${name} ($${absAmount})!`, {
      icon: <Bell className="w-4 h-4 text-primary" />,
    });
  };

  return (
    <Card className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border-border flex flex-col gap-4 select-none">
      <CardHeader className="p-0 flex flex-row items-center justify-between pb-1 border-b border-border/40 space-y-0">
        <div>
          <CardTitle className="font-display font-extrabold text-lg text-foreground">
            Flatmate Standings
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Net domestic balances across all open tabs
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-2.5 py-1 bg-surface-container text-foreground font-mono text-[10px] font-bold uppercase rounded-lg border-border/50"
        >
          Active Tab
        </Badge>
      </CardHeader>

      {/* Roster Balance Rows */}
      <CardContent className="p-0 flex flex-col gap-2">
        {memberStandings.length === 0 ? (
          <div className="py-6 px-4 text-center rounded-xl bg-surface-container/60 border border-dashed border-border/60">
            <Users className="w-5 h-5 mx-auto text-muted-foreground mb-1.5 opacity-60" />
            <p className="text-xs font-bold text-foreground">No flatmate balances yet</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Log a shared bill above to calculate domestic tabs.
            </p>
          </div>
        ) : (
          memberStandings.map((m) => {
            const isPositive = m.balance > 0.01;
            const isNegative = m.balance < -0.01;
            const initial = (m.name[0] || 'U').toUpperCase();

            return (
              <div
                key={m.userId}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 rounded-xl border transition-all ${
                  m.isCurrentUser
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-surface-container border-border/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarFallback
                      className={`font-bold text-xs shadow-xs ${
                        m.isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-surface-container-high text-foreground'
                      }`}
                    >
                      {initial}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs sm:text-sm text-foreground truncate">
                        {m.name}
                      </span>
                      {m.isCurrentUser && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono font-bold text-primary px-1.5 py-0.2 rounded bg-primary/10"
                        >
                          YOU
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{m.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 w-full sm:w-auto pl-12 sm:pl-0">
                  {/* Action Button: Nudge / Settle for owing roommates */}
                  {isNegative && !m.isCurrentUser && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (onOpenSettleModal) {
                          onOpenSettleModal({
                            fromUserId: m.userId,
                            fromName: m.name,
                            toUserId: currentUserId,
                            toName: 'You',
                            amount: Math.abs(m.balance),
                          });
                        } else {
                          handleNudge(m.name, m.balance);
                        }
                      }}
                      className="min-h-[36px] px-2.5 text-[11px] rounded-lg border-border/80 hover:bg-muted font-semibold flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Bell className="w-3 h-3 text-primary" />
                      <span>Nudge</span>
                    </Button>
                  )}

                  {isNegative && m.isCurrentUser && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => onOpenSettleModal?.()}
                      className="h-7 px-2.5 text-[11px] rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-1 cursor-pointer active:scale-95 shadow-2xs"
                    >
                      <Zap className="w-3 h-3 fill-current" />
                      <span>Settle</span>
                    </Button>
                  )}

                  {/* Amount Chip */}
                  <Badge
                    variant="outline"
                    className={`px-3 py-1 rounded-lg font-bold text-xs tabular-nums ${
                      isPositive
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        : isNegative
                          ? 'bg-destructive/10 text-destructive border-destructive/20'
                          : 'bg-surface-container-high text-muted-foreground border-transparent'
                    }`}
                  >
                    {isPositive
                      ? `+$${m.balance.toFixed(2)}`
                      : isNegative
                        ? `-$${Math.abs(m.balance).toFixed(2)}`
                        : '$0.00'}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

export default FlatmateStandingsCard;
