import { Zap, QrCode, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import useHousehold from '@/hooks/useHousehold';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { HouseholdTabId } from './HouseholdTabBar';

interface HouseholdFooterDockProps {
  onSelectTab: (tab: HouseholdTabId) => void;
}

export function HouseholdFooterDock({ onSelectTab }: HouseholdFooterDockProps) {
  const { activeHousehold } = useHousehold();
  const [copied, setCopied] = useState(false);

  const inviteCode = activeHousehold?.inviteCode || 'X7K9P2A4';

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Household passkey copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const wifiName = activeHousehold?.settings?.wifiSsid || 'Loft_4B_5G';
  const wifiPass = activeHousehold?.settings?.wifiPassword;
  const trashNight = activeHousehold?.settings?.trashDay || 'Wednesday';

  const handleCopyWifi = () => {
    if (wifiPass) {
      navigator.clipboard.writeText(wifiPass);
      toast.success(`Copied Wi-Fi password for "${wifiName}"!`);
    } else {
      navigator.clipboard.writeText(wifiName);
      toast.success(`Copied Wi-Fi network name: "${wifiName}"`);
    }
  };

  return (
    <Card
      aria-label="Quick Contextual Disclosure Dock"
      className="w-full bg-card rounded-2xl p-4 shadow-xs border-border select-none"
    >
      <CardContent className="p-0 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-semibold text-xs text-foreground font-display">
              Quick Passkey Dock:
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="px-2.5 py-1 min-h-[36px] h-auto rounded-lg bg-surface-container font-mono text-foreground font-bold text-xs flex items-center gap-1.5 hover:bg-surface-container-high transition-colors cursor-pointer border-border/60"
              title="Click to copy passkey"
            >
              <span>{inviteCode}</span>
              {copied ? (
                <Check className="w-3 h-3 text-emerald-500" />
              ) : (
                <Copy className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span>•</span>
            <button
              type="button"
              onClick={handleCopyWifi}
              className="hover:text-foreground transition-colors cursor-pointer underline-offset-2 hover:underline"
              title={wifiPass ? 'Click to copy Wi-Fi password' : 'Wi-Fi Network'}
            >
              WiFi: {wifiName} {wifiPass ? '(Password saved)' : ''}
            </button>
            <span>•</span>
            <span>Trash Night: {trashNight} 8 PM</span>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectTab('tab-invites')}
            className="px-3.5 py-1.5 min-h-[44px] h-auto rounded-full bg-surface-container hover:bg-surface-container-high text-foreground font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-border/80 active:scale-95"
          >
            <QrCode className="w-3.5 h-3.5 text-primary" />
            <span>Instant QR</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => onSelectTab('tab-offboarding')}
            className="px-3.5 py-1.5 min-h-[44px] h-auto rounded-full bg-surface-container hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 text-foreground font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer border-border/80 active:scale-95"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Departure</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default HouseholdFooterDock;
