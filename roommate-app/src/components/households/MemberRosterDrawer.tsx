import { useState } from 'react';
import { Check, Copy, Settings, Users } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useHouseholdMembersQuery } from '@/hooks/queries/useHouseholdQueries';
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/utils/utils';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenSettings?: () => void;
};

export default function MemberRosterDrawer({
  household,
  open,
  onOpenChange,
  onOpenSettings,
}: Props) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const { data: members = [], isLoading } = useHouseholdMembersQuery(
    household?.householdId
  );

  const displayMembers =
    members.length > 0 ? members : household?.members || [];

  const handleCopyCode = async () => {
    if (!household?.inviteCode) return;
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: 'Invite code copied to clipboard.',
      });
    } catch {
      toast({
        title: 'Copy Failed',
        description: 'Could not copy to clipboard.',
        variant: 'destructive',
      });
    }
  };

  if (!household) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md bg-surface border-l-2 border-border p-0 flex flex-col h-full shadow-2xl overflow-hidden"
      >
        {/* Drawer Header */}
        <SheetHeader className="p-content-padding border-b border-border bg-surface-container flex flex-row items-center justify-between space-y-0">
          <div>
            <SheetTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Roster
            </SheetTitle>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mt-0.5">
              {displayMembers.length} Roommate{displayMembers.length !== 1 ? 's' : ''} in{' '}
              <span className="font-bold text-foreground">{household.name}</span>
            </p>
          </div>
        </SheetHeader>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-content-padding space-y-6">
          {/* Invite Section */}
          <div className="bg-primary-container border-[1.5px] border-border p-card-padding rounded-lg text-primary-foreground relative overflow-hidden shadow-sm">
            <h4 className="font-bold text-sm mb-1">Invite Roommates</h4>
            <p className="text-xs opacity-90 mb-3">Share this code to grant access to this space</p>
            <div className="flex items-center gap-2 bg-surface border border-border p-2 rounded">
              <code className="font-mono text-lg tracking-widest font-bold text-foreground flex-1 text-center select-all">
                {household.inviteCode}
              </code>
              <Button
                type="button"
                size="sm"
                onClick={handleCopyCode}
                className="bg-primary-container hover:opacity-90 text-primary-foreground font-bold px-3 py-1.5 h-auto text-xs active:scale-95 transition-all cursor-pointer shadow-none"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1 text-white" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-2">
              Current Members
            </h4>

            {isLoading ? (
              <div className="space-y-2 py-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-14 bg-surface-container animate-pulse rounded-lg border border-border/30"
                  />
                ))}
              </div>
            ) : displayMembers.length > 0 ? (
              <div className="space-y-2.5">
                {displayMembers.map((member) => {
                  const isAdmin = member.role === 'ADMIN';
                  const initials = getInitials(member.user?.name);

                  return (
                    <div
                      key={member.householdMemberId || member.userId}
                      className="flex items-center gap-3 bg-surface-container border border-border p-3 rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      <div
                        className={`w-10 h-10 border border-border rounded-full flex items-center justify-center font-bold text-sm shrink-0 font-mono shadow-sm ${
                          isAdmin
                            ? 'bg-primary-container text-primary-foreground'
                            : 'bg-surface text-foreground'
                        }`}
                      >
                        {initials}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h5 className="text-sm font-bold text-foreground truncate">
                            {member.user?.name || 'Roommate'}
                          </h5>
                          <span
                            className={`px-1.5 py-0.2 text-[10px] uppercase tracking-wider font-bold border border-border rounded ${
                              isAdmin
                                ? 'bg-primary-container text-primary-foreground'
                                : 'bg-surface text-muted-foreground'
                            }`}
                          >
                            {member.role || 'MEMBER'}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.user?.email || ''}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground py-4 text-center">
                No members found. Share the invite code above to get started.
              </p>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-content-padding border-t border-border bg-surface-container">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onOpenSettings?.();
            }}
            className="w-full bg-surface hover:bg-surface-container-high border-border text-foreground font-bold py-2.5 rounded active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Household Settings
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
