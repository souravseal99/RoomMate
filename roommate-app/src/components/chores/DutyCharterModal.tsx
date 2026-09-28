import { BookOpen, X, CheckCircle, ShieldCheck } from 'lucide-react';

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
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-card rounded-2xl p-6 shadow-xl border border-border flex flex-col gap-4 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div>
              <h3 className="font-display font-bold text-base sm:text-lg text-foreground">
                Household Duty Charter
              </h3>
              <p className="text-xs text-muted-foreground">
                Shared co-living standards &amp; rotation agreements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Charter Principles */}
        <div className="flex flex-col gap-3 py-1">
          {CHARTER_RULES.map((rule, idx) => (
            <div
              key={rule.title}
              className="p-3.5 rounded-xl bg-surface-container-low/60 border border-border/40 flex items-start gap-3"
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
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-[11px] text-muted-foreground italic flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Agreed by 4/4 flatmates
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 min-h-[44px] rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-xs transition-all cursor-pointer active:scale-95"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
}
