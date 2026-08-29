import { useState } from 'react';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function DangerZoneCard() {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE MY ACCOUNT') return;

    setIsDeleting(true);
    try {
      // Future backend account deletion endpoint call
      toast.info('Account offboarding requested. Contact support for complete deletion.');
      setIsConfirmOpen(false);
    } catch {
      toast.error('Failed to process account deletion request.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <section className="max-w-2xl mx-auto w-full pt-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-destructive/10 border border-destructive/20 p-4 sm:p-5 rounded-2xl">
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-destructive flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Danger Zone</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md">
              Permanently delete your account and all personal associated records. This action cannot be undone.
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            onClick={() => setIsConfirmOpen(true)}
            className="shrink-0 font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs cursor-pointer active:scale-95 transition-all"
          >
            Delete Account
          </Button>
        </div>
      </section>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-card text-foreground border-border max-w-md p-6 rounded-2xl space-y-4">
          <DialogHeader>
            <DialogTitle className="text-lg font-extrabold text-destructive flex items-center gap-2">
              <Trash2 className="w-5 h-5" />
              Delete Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-2">
              This will permanently delete your profile, active sessions, and remove you from all shared households.
              Type <strong className="text-foreground select-all">DELETE MY ACCOUNT</strong> below to confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="DELETE MY ACCOUNT"
              className="bg-surface border-border text-foreground text-xs font-mono font-bold"
            />

            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmOpen(false)}
                className="font-bold rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={confirmText !== 'DELETE MY ACCOUNT' || isDeleting}
                onClick={handleDeleteAccount}
                className="font-extrabold rounded-xl"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Permanently Delete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
