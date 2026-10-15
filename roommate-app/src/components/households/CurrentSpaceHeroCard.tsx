import { useState } from 'react';
import {
  Calendar,
  Copy,
  Check,
  QrCode,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { HouseholdResponse, HouseholdMember } from '@/types/householdTypes';

interface CurrentSpaceHeroCardProps {
  household: HouseholdResponse;
  members: HouseholdMember[];
  onOpenInvite: () => void;
  onOpenSettings: () => void;
}

export function CurrentSpaceHeroCard({
  household,
  members,
  onOpenInvite,
  onOpenSettings,
}: CurrentSpaceHeroCardProps) {
  const [copied, setCopied] = useState(false);

  const displayMembers = members.length > 0 ? members : household.members || [];
  const inviteCode = household.inviteCode || 'X7K9P2A4';

  // Dynamic tenure calculation
  const tenureDays = household.createdAt
    ? Math.max(1, Math.floor((Date.now() - new Date(household.createdAt).getTime()) / 86400000))
    : 124;

  const createdDate = household.createdAt
    ? new Date(household.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
    : 'June 1, 2024';

  const handleCopyPasskey = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Household passkey copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic billing cycle & rollover calculation
  const billingDay = household.settings?.billingCycleDay ?? 1;
  const now = new Date();
  const currentMonthName = now.toLocaleString('en-US', { month: 'short' });
  const currentMonthNumber = String(now.getMonth() + 1).padStart(2, '0');
  const cycleText = `Cycle ${currentMonthNumber} / ${currentMonthName}`;

  const nextRolloverDate = new Date(
    now.getFullYear(),
    now.getMonth() + (now.getDate() >= billingDay ? 1 : 0),
    billingDay
  );
  const daysUntilRollover = Math.max(1, Math.ceil((nextRolloverDate.getTime() - now.getTime()) / 86400000));
  const rolloverText = `Rollover in ${daysUntilRollover} ${daysUntilRollover === 1 ? 'day' : 'days'}`;
  const unitText = household.settings?.unitOrApt ? `• ${household.settings.unitOrApt}` : '';

  return (
    <Card
      aria-label="Household Identity & Fast Actions"
      className="w-full bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-4 select-none"
    >
      <CardContent className="p-0 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Household Meta Group */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold uppercase tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {cycleText}
            </Badge>
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border-primary/20 font-mono text-[10px] font-bold uppercase tracking-wider"
            >
              {displayMembers.length} Active Flatmates
            </Badge>
          </div>

          <h1 className="font-bold text-2xl sm:text-3xl text-foreground font-display tracking-tight leading-tight">
            {household.name} {unitText} - Household Hub
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Living together {tenureDays} days
            </span>
            <span>•</span>
            <span>Created {createdDate}</span>
            <span>•</span>
            <span className="text-primary font-bold">{rolloverText}</span>
          </div>
        </div>

        {/* Fast Actions & Passkey Pill */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <div className="flex items-center bg-surface-container px-3.5 py-1.5 rounded-full gap-2.5 border border-border/80 shadow-xs">
            <div className="flex flex-col">
              <span className="text-[9px] font-mono font-bold text-muted-foreground uppercase leading-none">
                Passkey
              </span>
              <span className="font-mono font-bold text-xs text-foreground tracking-wider mt-0.5">
                {inviteCode}
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleCopyPasskey}
              aria-label="Copy household passkey"
              className="w-8 h-8 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-foreground flex items-center justify-center transition-colors cursor-pointer p-0"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </Button>
          </div>

          <Button
            type="button"
            onClick={onOpenInvite}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 min-h-[44px] h-auto rounded-full font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan to Join</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={onOpenSettings}
            aria-label="Open space settings"
            className="w-11 h-11 min-h-[44px] min-w-[44px] rounded-full bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors border-border cursor-pointer active:scale-95 shadow-xs"
            title="Space Settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default CurrentSpaceHeroCard;

