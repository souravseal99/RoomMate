import { useState } from 'react';
import {
  Check,
  Copy,
  Edit,
  LogOut,
  MoreVertical,
  Trash2,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import useHousehold from '@/hooks/useHousehold';
import useAuth from '@/hooks/useAuth';
import type { HouseholdResponse } from '@/types/householdTypes';

type Props = {
  household: HouseholdResponse;
  onOpenRoster: (household: HouseholdResponse) => void;
  onOpenEdit: (household: HouseholdResponse) => void;
  onOpenLeave: (household: HouseholdResponse) => void;
  onOpenDelete: (household: HouseholdResponse) => void;
};

export default function HouseholdCard({
  household,
  onOpenRoster,
  onOpenEdit,
  onOpenLeave,
  onOpenDelete,
}: Props) {
  const [copied, setCopied] = useState(false);
  const { selectedHousehold, switchActiveHousehold } = useHousehold();
  const { email } = useAuth();
  const { toast } = useToast();

  const isActive = selectedHousehold?.key === household.householdId;
  const memberCount = household.members?.length || 0;

  // Determine if current user is admin in this space
  const currentMember = household.members?.find((m) => m.user?.email === email);
  const isAdmin =
    currentMember?.role === 'ADMIN' || (household.members?.[0]?.user?.email === email);

  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(household.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: 'Copied!',
        description: `Invite code "${household.inviteCode}" copied to clipboard.`,
      });
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to copy invite code.',
        variant: 'destructive',
      });
    }
  };

  const handleCardClick = () => {
    if (!isActive) {
      switchActiveHousehold(household.householdId);
    }
  };

  return (
    <Card
      onClick={handleCardClick}
      className={`group relative bg-card border-[1.5px] p-card-padding rounded-lg transition-all duration-200 cursor-pointer overflow-hidden flex flex-col justify-between min-h-[190px] ${
        isActive
          ? 'border-primary-container shadow-[0_0_15px_2px_rgba(255,109,31,0.3)] ring-2 ring-primary-container'
          : 'border-border shadow-sm hover:border-primary/60 hover:-translate-y-1'
      }`}
    >
      {/* Top Banner / Active Tag */}
      {isActive && (
        <div className="absolute top-0 right-0 bg-primary-container text-primary-foreground font-bold text-[10px] px-2.5 py-0.5 rounded-bl-md uppercase tracking-wider shadow-xs">
          Active Space
        </div>
      )}

      <CardContent className="p-0 flex flex-col justify-between flex-1">
        {/* Header Section */}
        <div>
          <div className="flex items-start justify-between gap-2 pr-16 mb-2">
            <h3 className="font-bold text-lg text-foreground truncate group-hover:text-primary transition-colors">
              {household.name}
            </h3>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span
              className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border rounded ${
                isAdmin
                  ? 'bg-primary-container text-primary-foreground border-border'
                  : 'bg-surface text-muted-foreground border-border'
              }`}
            >
              {isAdmin ? 'Admin' : 'Member'}
            </span>

            <span className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              {memberCount} member{memberCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Action / Context Menu Trigger */}
        <div
          className="absolute top-3.5 right-3.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full hover:bg-surface-container text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
                <span className="sr-only">Actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-surface border-border shadow-tactile">
              <DropdownMenuItem
                onClick={() => onOpenEdit(household)}
                className="cursor-pointer text-xs font-medium focus:bg-surface-container"
              >
                <Edit className="w-3.5 h-3.5 mr-2" />
                Edit Name
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onOpenLeave(household)}
                className="cursor-pointer text-xs font-medium text-destructive focus:bg-destructive/10"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                Leave Household
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuSeparator className="bg-border/30" />
                  <DropdownMenuItem
                    onClick={() => onOpenDelete(household)}
                    className="cursor-pointer text-xs font-medium text-destructive focus:bg-destructive/10"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete Household
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Footer Actions */}
        <div
          className="pt-3 border-t border-border flex items-center justify-between gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleCopyCode}
            className="text-xs font-bold text-primary hover:bg-surface-container px-2.5 h-8 rounded cursor-pointer active:scale-95 transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1 text-primary-container" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                Invite
              </>
            )}
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenRoster(household)}
            className="text-xs font-bold bg-surface hover:bg-surface-container-high border-border text-foreground px-3.5 h-8 rounded active:scale-95 transition-all cursor-pointer"
          >
            Roommates
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
