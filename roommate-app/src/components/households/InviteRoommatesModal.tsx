import { useState } from 'react';
import { Copy, Check, MessageCircle, Share2, Link as LinkIcon, UserPlus, QrCode } from 'lucide-react';
import { QRCodeSVG } from '@/components/ui/qrcode';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { HouseholdResponse } from '@/types/householdTypes';

interface InviteRoommatesModalProps {
  household: HouseholdResponse | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteRoommatesModal({
  household,
  open,
  onOpenChange,
}: InviteRoommatesModalProps) {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

  if (!household) return null;

  const inviteCode = household.inviteCode || '';
  const joinUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/join?code=${inviteCode}`
    : `https://roommate.app/join?code=${inviteCode}`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopiedLink(true);
      toast.success('Invite link copied to clipboard!');
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hey! Join our shared household "${household.name}" on RoomMate 🏠\n\nInvite Code: ${inviteCode}\nDirect Link: ${joinUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${household.name} on RoomMate`,
          text: `Hey! Join our shared space "${household.name}" on RoomMate using code: ${inviteCode}`,
          url: joinUrl,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-md p-6 max-h-[90vh] overflow-y-auto rounded-2xl select-none">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            <span>Invite Roommates</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Share this code or scan the QR to let flatmates join{' '}
            <span className="font-semibold text-foreground">{household.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* QR Code Section */}
          <Card className="bg-surface-container rounded-2xl p-5 border-border/70 flex flex-col items-center justify-center text-center space-y-3">
            <CardContent className="p-0 flex flex-col items-center justify-center text-center space-y-3 w-full">
              <div className="flex items-center justify-between w-full">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 font-mono">
                  <QrCode className="w-3.5 h-3.5 text-primary" />
                  Scan to Join
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowQrCode(!showQrCode)}
                  className="text-xs text-primary font-bold hover:underline cursor-pointer p-0 h-auto"
                >
                  {showQrCode ? 'Hide QR' : 'Show QR'}
                </Button>
              </div>

              {showQrCode && (
                <div className="p-3.5 bg-white rounded-xl shadow-xs border border-border/40 transition-all">
                  <QRCodeSVG
                    value={joinUrl}
                    size={150}
                    level="M"
                    includeMargin={false}
                    className="w-36 h-36"
                  />
                </div>
              )}

              {/* Invite Code Display */}
              <div className="w-full pt-1 space-y-2">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-mono block text-left">
                  8-Character Invite Code
                </span>
                <div className="p-3 bg-surface-container-high rounded-xl border border-border/80 flex items-center justify-between">
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-widest font-mono text-primary select-all pl-2">
                    {inviteCode}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCopyCode}
                    aria-label="Copy Invite Code"
                    className="min-w-[44px] min-h-[44px] rounded-lg bg-surface hover:bg-surface-container text-foreground transition-colors flex items-center justify-center border-border/50 cursor-pointer active:scale-95 shadow-xs"
                    title="Copy Invite Code"
                  >
                    {copiedCode ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Sharing Options with 44px Touch Targets */}
          <div className="space-y-2.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider font-mono block">
              Quick Share
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={handleWhatsAppShare}
                className="min-h-[44px] text-xs font-semibold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-xl"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Group</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleNativeShare}
                className="min-h-[44px] text-xs font-semibold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-xl"
              >
                <Share2 className="w-4 h-4 text-primary" />
                <span>Share Device</span>
              </Button>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={handleCopyLink}
              className="w-full min-h-[44px] text-xs font-semibold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98 rounded-xl"
            >
              {copiedLink ? (
                <>
                  <Check className="w-4 h-4 text-primary" />
                  <span>Direct Link Copied!</span>
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 text-primary" />
                  <span>Copy Direct Join Link</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default InviteRoommatesModal;
