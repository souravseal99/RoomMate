import { useState } from 'react';
import { MessageSquare, Mail, Copy, Check } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { QRCodeSVG } from '@/components/ui/qrcode';
import { toast } from 'sonner';

export function InvitesNetworksTab() {
  const { activeHousehold } = useHousehold();
  const [copied, setCopied] = useState(false);

  const inviteCode = activeHousehold?.inviteCode || 'X7K9P2A4';
  const joinUrl = `${window.location.origin}/join?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Household passkey copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Join our flat "${activeHousehold?.name || 'Downtown Loft'}" on RoomMate to manage shared expenses, chores, and groceries: ${joinUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(
      `Welcome to ${activeHousehold?.name || 'Our Space'} — RoomMate Onboarding Pack`
    );
    const body = encodeURIComponent(
      `Hey!\n\nHere is our RoomMate household join link: ${joinUrl}\nHousehold Passkey: ${inviteCode}\n\nLet's get expenses, chores, and pantry supplies organized smoothly!`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleInvitePast = (name: string) => {
    toast.success(`Invite token sent to ${name}!`);
  };

  return (
    <div className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
        <div>
          <h2 className="font-bold text-lg text-foreground font-display tracking-tight">
            Multi-Channel Invite Engine
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite incoming flatmates or reconnect with trusted roomies from previous spaces.
          </p>
        </div>
        <button
          type="button"
          onClick={() => toast.success('Temporary sublease token generated: SUB-7104')}
          className="px-4 py-2 min-h-[44px] rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all self-start md:self-auto cursor-pointer border-b-2 border-primary-fixed-dim"
        >
          + Generate Temporary Sublease Token
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left QR Box (5 cols) */}
        <div className="md:col-span-5 bg-surface-container p-6 rounded-xl border border-border/80 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-48 h-48 bg-white rounded-2xl p-3 shadow-md border border-border/60 flex items-center justify-center">
            <QRCodeSVG value={joinUrl} size={168} className="w-full h-full" />
          </div>

          <div className="flex flex-col gap-1 max-w-xs">
            <span className="font-bold text-xs text-foreground font-display">
              {activeHousehold?.name || 'Unit 4B'} Instant Onboarding
            </span>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Scan with phone camera or RoomMate client. Instant verification.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-1.5 rounded-full shadow-xs">
            <span className="text-xs font-mono font-bold text-primary tracking-wider">
              Passkey: {inviteCode}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Copy household passkey"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Right Sharing Channels & Past Flatmates (7 cols) */}
        <div className="md:col-span-7 flex flex-col gap-5">
          <span className="font-bold text-xs text-foreground font-display">
            Direct Share Channels
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* WhatsApp */}
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="p-3.5 bg-surface-container hover:bg-surface-container-high rounded-xl border border-border flex items-center gap-3 transition-all text-left cursor-pointer active:scale-95 min-h-[44px]"
            >
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-foreground truncate">
                  WhatsApp Group Link
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Post deep-link to group chat
                </span>
              </div>
            </button>

            {/* Email Pack */}
            <button
              type="button"
              onClick={handleEmailShare}
              className="p-3.5 bg-surface-container hover:bg-surface-container-high rounded-xl border border-border flex items-center gap-3 transition-all text-left cursor-pointer active:scale-95 min-h-[44px]"
            >
              <div className="w-10 h-10 rounded-full bg-primary-container text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-xs text-foreground truncate">
                  Email Onboarding Pack
                </span>
                <span className="text-[10px] text-muted-foreground truncate">
                  Send WiFi, keys &amp; rules
                </span>
              </div>
            </button>
          </div>

          {/* Past Flatmates Discovery */}
          <span className="font-bold text-xs text-foreground font-display pt-2">
            Familiar Flatmates from Past Spaces
          </span>

          <div className="flex flex-col gap-2.5">
            <div className="bg-surface-container-low p-3.5 rounded-xl border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-foreground font-bold text-xs flex items-center justify-center font-mono shrink-0">
                  MR
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground truncate">
                    Maya Rodriguez
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    Lived together in "Pacific Heights Flat" (2022-2023)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleInvitePast('Maya Rodriguez')}
                className="px-3.5 py-1.5 min-h-[44px] rounded-full bg-surface-container hover:bg-primary hover:text-primary-foreground font-semibold text-xs text-foreground transition-all shrink-0 cursor-pointer active:scale-95"
              >
                Invite
              </button>
            </div>

            <div className="bg-surface-container-low p-3.5 rounded-xl border border-border flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-surface-container-high text-foreground font-bold text-xs flex items-center justify-center font-mono shrink-0">
                  JW
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground truncate">
                    Julian Ward
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    Lived together in "Mission Loft Collective" (2023)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleInvitePast('Julian Ward')}
                className="px-3.5 py-1.5 min-h-[44px] rounded-full bg-surface-container hover:bg-primary hover:text-primary-foreground font-semibold text-xs text-foreground transition-all shrink-0 cursor-pointer active:scale-95"
              >
                Invite
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitesNetworksTab;
