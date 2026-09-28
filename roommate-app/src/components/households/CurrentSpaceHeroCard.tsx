import { useState } from 'react';
import {
  Calendar,
  Copy,
  Check,
  QrCode,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
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

  return (
    <section
      aria-label="Household Identity & Fast Actions"
      className="w-full bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-4 select-none"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Household Meta Group */}
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
              {household.name} • Unit 4B
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              Cycle 04 / Oct
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary font-mono text-[10px] font-bold uppercase tracking-wider">
              {displayMembers.length} Active Flatmates
            </span>
          </div>

          <h1 className="font-bold text-2xl sm:text-3xl text-foreground font-display tracking-tight leading-tight">
            {household.name} - Household Hub
          </h1>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Living together {tenureDays} days
            </span>
            <span>•</span>
            <span>Created {createdDate}</span>
            <span>•</span>
            <span className="text-primary font-bold">Next rollover in 8 days</span>
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
            <button
              type="button"
              onClick={handleCopyPasskey}
              aria-label="Copy household passkey"
              className="w-7 h-7 rounded-full bg-surface-container-high hover:bg-surface-container-highest text-foreground flex items-center justify-center transition-colors cursor-pointer"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-muted-foreground" />
              )}
            </button>
          </div>

          <button
            type="button"
            onClick={onOpenInvite}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 min-h-[44px] rounded-full font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all cursor-pointer border-b-2 border-primary-fixed-dim"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan to Join</span>
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Open space settings"
            className="w-10 h-10 min-h-[40px] rounded-full bg-surface-container hover:bg-surface-container-high text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors border border-border cursor-pointer active:scale-95"
            title="Space Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default CurrentSpaceHeroCard;
