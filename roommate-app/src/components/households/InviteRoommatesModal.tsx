import { useState } from 'react';
import { Copy, Check, MessageCircle, Link, UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card text-foreground border-border max-w-md p-6">
        <DialogHeader className="border-b border-border/40 pb-3">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Roommates
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Share this code or link with your flatmates to let them join{' '}
            <span className="font-semibold text-foreground">{household.name}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Invite Code Display Box */}
          <div className="bg-surface-container rounded-2xl p-5 border border-border/70 text-center space-y-2">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
              8-Character Invite Code
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-widest font-mono text-primary select-all">
                {inviteCode}
              </span>
            </div>
            <Button
              onClick={handleCopyCode}
              className="w-full h-10 mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98"
            >
              {copiedCode ? (
                <>
                  <Check className="w-4 h-4" /> Copied Code!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" /> Copy Invite Code
                </>
              )}
            </Button>
          </div>

          {/* Quick Sharing Options */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Quick Share
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                onClick={handleWhatsAppShare}
                className="h-10 text-xs font-semibold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                WhatsApp Group
              </Button>

              <Button
                variant="outline"
                onClick={handleCopyLink}
                className="h-10 text-xs font-semibold border-border bg-surface-container-low hover:bg-surface-container text-foreground flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-primary" />
                    Link Copied
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4 text-primary" />
                    Copy Direct Link
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
