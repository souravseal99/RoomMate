import { useState } from 'react';
import { MessageSquare, Mail, Copy, Check, Users, Link2 } from 'lucide-react';
import useHousehold from '@/hooks/useHousehold';
import { useSuggestedMembersQuery } from '@/hooks/queries/useHouseholdQueries';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { QRCodeSVG } from '@/components/ui/qrcode';
import { toast } from 'sonner';

export function InvitesNetworksTab() {
  const { activeHousehold } = useHousehold();
  const { data: suggestedMembers = [], isLoading: isLoadingSuggested } = useSuggestedMembersQuery();
  const [copied, setCopied] = useState(false);

  const inviteCode = activeHousehold?.inviteCode || 'ROOM-MATE';
  const joinUrl = `${window.location.origin}/join?code=${inviteCode}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success('Household passkey copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(joinUrl);
    toast.success('Instant onboarding link copied to clipboard!');
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Join our flat "${activeHousehold?.name || 'Our Space'}" on RoomMate to manage shared expenses, chores, and groceries: ${joinUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmailShare = (recipientEmail?: string, recipientName?: string) => {
    const greeting = recipientName ? `Hey ${recipientName}!` : 'Hey!';
    const subject = encodeURIComponent(
      `Join ${activeHousehold?.name || 'Our Household'} on RoomMate`
    );
    const body = encodeURIComponent(
      `${greeting}\n\nHere is the onboarding link to join our space on RoomMate:\n${joinUrl}\n\nPasskey: ${inviteCode}\n\nLooking forward to having you!`
    );
    window.location.href = `mailto:${recipientEmail || ''}?subject=${subject}&body=${body}`;
  };

  return (
    <Card className="bg-card rounded-2xl p-5 sm:p-6 shadow-xs border-border flex flex-col gap-6 w-full animate-in fade-in duration-200 select-none">
      {/* Header */}
      <CardHeader className="p-0 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4 space-y-0">
        <div>
          <CardTitle className="font-bold text-lg text-foreground font-display tracking-tight">
            Multi-Channel Invite Engine
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            Invite incoming flatmates or reconnect with trusted roomies from previous spaces.
          </p>
        </div>
        <Button
          type="button"
          onClick={handleCopyLink}
          className="px-4 py-2 min-h-[44px] h-auto rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-xs hover:bg-primary/90 active:scale-95 transition-all self-start md:self-auto cursor-pointer border-b-2 border-primary-fixed-dim flex items-center gap-1.5"
        >
          <Link2 className="w-3.5 h-3.5" />
          <span>Copy Instant Join Link</span>
        </Button>
      </CardHeader>

      <CardContent className="p-0">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Left QR Box (5 cols) */}
          <Card className="md:col-span-5 bg-surface-container p-6 rounded-xl border-border/80 flex flex-col items-center justify-center text-center gap-4 shadow-xs">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center gap-4 w-full">
              <div className="w-48 h-48 bg-white rounded-2xl p-3 shadow-md border border-border/60 flex items-center justify-center">
                <QRCodeSVG value={joinUrl} size={168} className="w-full h-full" />
              </div>

              <div className="flex flex-col gap-1 max-w-xs">
                <span className="font-bold text-xs text-foreground font-display">
                  {activeHousehold?.name || 'Household'} Instant Onboarding
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Scan with phone camera or RoomMate client for instant membership.
                </p>
              </div>

              <div className="flex items-center gap-2 bg-card border border-border px-3.5 py-1.5 rounded-full shadow-xs">
                <span className="text-xs font-mono font-bold text-primary tracking-wider">
                  Passkey: {inviteCode}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  aria-label="Copy household passkey"
                  className="w-6 h-6 rounded-full text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-0"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Right Sharing Channels & Past Flatmates (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            <span className="font-bold text-xs text-foreground font-display">
              Direct Share Channels
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* WhatsApp */}
              <Button
                type="button"
                variant="outline"
                onClick={handleWhatsAppShare}
                className="p-3.5 h-auto bg-surface-container hover:bg-surface-container-high rounded-xl border-border flex items-center justify-start gap-3 transition-all text-left cursor-pointer active:scale-95 min-h-[44px]"
              >
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground truncate">
                    WhatsApp Group Link
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">
                    Post deep-link to group chat
                  </span>
                </div>
              </Button>

              {/* Email Pack */}
              <Button
                type="button"
                variant="outline"
                onClick={() => handleEmailShare()}
                className="p-3.5 h-auto bg-surface-container hover:bg-surface-container-high rounded-xl border-border flex items-center justify-start gap-3 transition-all text-left cursor-pointer active:scale-95 min-h-[44px]"
              >
                <div className="w-10 h-10 rounded-full bg-primary-container text-primary-foreground flex items-center justify-center shrink-0 shadow-xs">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-xs text-foreground truncate">
                    Email Onboarding Pack
                  </span>
                  <span className="text-[10px] text-muted-foreground truncate font-mono">
                    Send join link and passkey
                  </span>
                </div>
              </Button>
            </div>

            {/* Past Flatmates Discovery */}
            <span className="font-bold text-xs text-foreground font-display pt-2">
              Familiar Flatmates from Past Spaces
            </span>

            <div className="flex flex-col gap-2.5">
              {isLoadingSuggested ? (
                <div className="p-4 text-center text-xs text-muted-foreground font-mono">
                  Loading suggestions...
                </div>
              ) : suggestedMembers.length > 0 ? (
                suggestedMembers.map((sm) => {
                  const initials = sm.name
                    ? sm.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
                    : sm.email.slice(0, 2).toUpperCase();

                  return (
                    <Card key={sm.userId} className="bg-surface-container-low p-3.5 rounded-xl border-border shadow-xs">
                      <CardContent className="p-0 flex items-center justify-between gap-3 w-full">
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar className="w-9 h-9 rounded-full shrink-0 shadow-xs border border-border">
                            <AvatarFallback className="bg-surface-container-high text-foreground font-bold text-xs font-mono">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-xs text-foreground truncate">
                              {sm.name || sm.email}
                            </span>
                            <span className="text-[11px] text-muted-foreground truncate font-mono">
                              {sm.sharedHouseholds?.length > 0
                                ? `Co-lived in ${sm.sharedHouseholds.join(', ')}`
                                : sm.email}
                            </span>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmailShare(sm.email, sm.name)}
                          className="px-3.5 py-1.5 min-h-[44px] h-auto rounded-full bg-surface-container hover:bg-primary hover:text-primary-foreground font-semibold text-xs text-foreground transition-all shrink-0 cursor-pointer active:scale-95 border-border"
                        >
                          Invite
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="bg-surface-container-low p-4 rounded-xl border-border/80 shadow-xs text-center flex flex-col items-center gap-1.5">
                  <Users className="w-6 h-6 text-primary mb-1" />
                  <span className="font-bold text-xs text-foreground">
                    No Past Co-Residents Found
                  </span>
                  <p className="text-[11px] text-muted-foreground max-w-sm">
                    As you live in multiple households, former flatmates will automatically appear here for quick invites to new spaces.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default InvitesNetworksTab;

