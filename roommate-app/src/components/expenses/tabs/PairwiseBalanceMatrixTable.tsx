import { ArrowRight, Check } from 'lucide-react';
import type { BalanceEntry } from '@/types/expenseTypes';
import type { HouseholdMember } from '@/types/householdTypes';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface PairwiseBalanceMatrixTableProps {
  balances: BalanceEntry[];
  householdMembers: HouseholdMember[];
  currentUserId: string;
  onSettle: (target: any) => void;
}

export function PairwiseBalanceMatrixTable({
  balances,
  householdMembers,
  currentUserId,
  onSettle,
}: PairwiseBalanceMatrixTableProps) {
  // Build pairwise relationship list
  const pairwiseRows = householdMembers
    .filter((m) => m.userId !== currentUserId)
    .map((member) => {
      const entry = balances.find((b) => b.userId === member.userId);
      const rawBalance = entry ? entry.balance : 0;
      // If rawBalance is positive, they are owed money; if negative, they owe money
      // As an estimate between current user and this peer:
      const userEntry = balances.find((b) => b.userId === currentUserId);
      const userBalance = userEntry ? userEntry.balance : 0;

      let netAmount = 0;
      let owesYou = false;
      let youOwe = false;

      if (rawBalance < 0 && userBalance > 0) {
        netAmount = Math.min(Math.abs(rawBalance), userBalance);
        owesYou = true;
      } else if (rawBalance > 0 && userBalance < 0) {
        netAmount = Math.min(rawBalance, Math.abs(userBalance));
        youOwe = true;
      }

      return {
        member,
        netAmount,
        owesYou,
        youOwe,
        isSettled: netAmount < 0.01,
      };
    });

  return (
    <Card className="bg-card rounded-2xl shadow-xs p-5 sm:p-6 border-border space-y-4 select-none">
      <CardHeader className="p-0 flex flex-row items-center justify-between pb-2 border-b border-border/40 space-y-0">
        <div>
          <CardTitle className="font-display font-extrabold text-lg text-foreground">
            Pairwise Balance Matrix
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Detailed bilateral standing between you and each individual flatmate
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-0 overflow-x-auto">
        <Table className="w-full text-left text-xs">
          <TableHeader>
            <TableRow className="border-b border-border/40 text-muted-foreground font-mono text-[11px] uppercase">
              <TableHead className="py-2.5 px-3 font-semibold">Flatmate</TableHead>
              <TableHead className="py-2.5 px-3 font-semibold">Flow</TableHead>
              <TableHead className="py-2.5 px-3 font-semibold">Net Balance</TableHead>
              <TableHead className="py-2.5 px-3 font-semibold text-right">
                Settlement Action
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {pairwiseRows.map(({ member, netAmount, owesYou, youOwe, isSettled }) => {
              const initial = (member.user.name[0] || 'U').toUpperCase();

              return (
                <TableRow
                  key={member.userId}
                  className="hover:bg-surface-container/50 transition-colors"
                >
                  <TableCell className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="w-7 h-7 shrink-0">
                        <AvatarFallback className="bg-surface-container-high text-foreground font-bold text-xs">
                          {initial}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-bold text-foreground">{member.user.name}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 px-3 text-muted-foreground">
                    {owesYou ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                        They <ArrowRight className="w-3 h-3" /> You
                      </span>
                    ) : youOwe ? (
                      <span className="inline-flex items-center gap-1 text-destructive font-semibold text-[11px]">
                        You <ArrowRight className="w-3 h-3" /> Them
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-muted-foreground text-[11px]">
                        <Check className="w-3 h-3" /> Balanced
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3 px-3">
                    <span
                      className={`font-mono font-bold tabular-nums ${
                        owesYou
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : youOwe
                            ? 'text-destructive'
                            : 'text-muted-foreground'
                      }`}
                    >
                      {owesYou
                        ? `+$${netAmount.toFixed(2)}`
                        : youOwe
                          ? `-$${netAmount.toFixed(2)}`
                          : '$0.00'}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 px-3 text-right">
                    {isSettled ? (
                      <span className="text-[11px] font-mono text-muted-foreground">
                        All Square
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          onSettle({
                            fromUserId: youOwe ? currentUserId : member.userId,
                            fromName: youOwe ? 'You' : member.user.name,
                            toUserId: youOwe ? member.userId : currentUserId,
                            toName: youOwe ? member.user.name : 'You',
                            amount: netAmount,
                          })
                        }
                        className="px-3 min-h-[44px] rounded-lg bg-surface-container hover:bg-surface-container-high text-foreground font-bold text-xs transition-all cursor-pointer active:scale-95 border-border/50 h-auto py-1.5"
                      >
                        Settle Up
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default PairwiseBalanceMatrixTable;
