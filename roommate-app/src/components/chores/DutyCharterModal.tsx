import { CheckCircle, ShieldCheck } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DutyCharterModalProps {
  open: boolean;
  onClose: () => void;
}

const CHARTER_RULES = [
  {
    title: 'Zero-Blame Automatic Rota',
    desc: 'Duties rotate dynamically every Sunday at 10:00 AM. Unfinished tasks carry karma adjustments rather than resentment.',
  },
  {
    title: 'Clean-As-You-Cook Standard',
    desc: 'Personal meal prep cookware must be rinsed or loaded into the dishwasher within 4 hours. Counters wiped clean after use.',
  },
  {
    title: 'The 24-Hour Swap Window',
    desc: 'Need to skip a shift? Tap "Request Swap" at least 24 hours prior so a roommate can take over and earn +10 karma.',
  },
  {
    title: 'Communal Supply Restock',
    desc: 'When supplies run low (dish soap, sponge, paper towels), mark them down on the Pantry & Shared Cart page immediately.',
  },
];

export function DutyCharterModal({ open, onClose }: DutyCharterModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-xl border-border flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <DialogHeader className="p-0 border-b border-border/50 pb-3 text-left">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div>
              <DialogTitle className="font-display font-bold text-base sm:text-lg text-foreground">
                Household Duty Charter
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Shared co-living standards &amp; rotation agreements
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Charter Principles */}
        <div className="flex flex-col gap-3 py-1">
          {CHARTER_RULES.map((rule, idx) => (
            <Card
              key={rule.title}
              className="p-3.5 rounded-xl bg-surface-container-low/60 border-border/40 flex items-start gap-3 shadow-none"
            >
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <div className="flex flex-col gap-0.5">
                <h4 className="font-display font-bold text-xs sm:text-sm text-foreground">
                  {rule.title}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {rule.desc}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <DialogFooter className="flex flex-row items-center justify-between pt-2 border-t border-border/50 sm:justify-between">
          <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Agreed by 4/4 flatmates
          </span>
          <Button
            type="button"
            onClick={onClose}
            className="px-5 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Understood
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DutyCharterModal;
