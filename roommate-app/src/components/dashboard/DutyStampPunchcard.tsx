import { useState } from 'react';
import {
  CheckCircle2,
  Flame,
  Check,
  Clock,
  CheckCheck,
  Bell,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export function DutyStampPunchcard() {
  const [isUrgentStamped, setIsUrgentStamped] = useState(false);

  const handleStampUrgent = () => {
    if (!isUrgentStamped) {
      setIsUrgentStamped(true);
      toast.success('+15 House Karma earned! Stove chore verified.', {
        icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
      });
    } else {
      toast.info('Duty already certified for today.');
    }
  };

  const handleNudgeAlex = () => {
    toast.success('Gentle chore nudge sent to Alex Chen!', {
      icon: <Bell className="w-4 h-4 text-primary" />,
    });
  };

  return (
    <section
      aria-label="Duty Stamp Card & Rotation"
      className="bg-card rounded-2xl p-5 sm:p-6 border border-border shadow-xs space-y-4 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary-container text-primary-foreground flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 stroke-[2.2]" />
          </div>
          <h2 className="text-xs font-semibold tracking-wider uppercase text-foreground font-mono">
            Duty Stamp Card
          </h2>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold font-mono">
          <Flame className="w-3.5 h-3.5 fill-current" />
          <span>10-Day Streak</span>
        </div>
      </div>

      <p className="text-muted-foreground text-xs leading-relaxed">
        Rotational duties. Stamp complete to claim House Karma &amp; log verification.
      </p>

      {/* Chores List */}
      <div className="space-y-3">
        {/* Interactive Active Stamp Card 1 (Sourav / Urgent) */}
        <div
          id="duty-card-urgent"
          className={`p-3.5 rounded-xl border transition-all ${
            isUrgentStamped
              ? 'bg-surface-container/60 border-border opacity-80'
              : 'bg-primary/5 border-2 border-primary/40 shadow-xs'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <button
                type="button"
                onClick={handleStampUrgent}
                aria-label="Stamp chore completed"
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-[0_2px_0_#9A3412] mt-0.5 group shrink-0 active:scale-95 cursor-pointer border-b-2 border-primary-fixed-dim ${
                  isUrgentStamped
                    ? 'bg-emerald-600 text-white shadow-none'
                    : 'bg-primary text-primary-foreground hover:bg-primary/90'
                }`}
              >
                <Check className="w-5 h-5 group-hover:scale-110 transition-transform stroke-[2.8]" />
              </button>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-primary text-primary-foreground shadow-xs font-mono">
                    Sourav (You)
                  </span>
                  {!isUrgentStamped && (
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-destructive text-white animate-pulse font-mono">
                      ⚡ URGENT
                    </span>
                  )}
                </div>
                <h3
                  className={`font-bold text-xs text-foreground mt-1 leading-tight tracking-tight ${
                    isUrgentStamped ? 'line-through text-muted-foreground' : ''
                  }`}
                >
                  Wipe Kitchen Quartz &amp; Degrease Stove
                </h3>
                <p className="text-muted-foreground text-[11px] mt-0.5 font-medium flex items-center gap-1 font-mono">
                  <span className="text-destructive">●</span>
                  Due 7:00 PM · Main Kitchen
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 shrink-0">
              <div
                className={`font-mono px-2 py-0.5 rounded-md shadow-xs font-bold text-[11px] ${
                  isUrgentStamped
                    ? 'bg-emerald-600 text-white'
                    : 'bg-primary text-primary-foreground'
                }`}
              >
                {isUrgentStamped ? 'STAMPED ✓ (+15)' : '+15 Karma'}
              </div>
              <span className="text-[9px] font-semibold tracking-wider uppercase text-primary font-mono">
                {isUrgentStamped ? 'Certified' : 'Click to Stamp'}
              </span>
            </div>
          </div>
        </div>

        {/* Stamp Card 2 (Alex) */}
        <div className="p-3 rounded-xl bg-surface-container border border-border flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-xs text-foreground tracking-tight">
                  Alex Chen
                </span>
                <span className="text-[11px] text-secondary font-medium font-mono">
                  Due Tomorrow 10 AM
                </span>
              </div>
              <h3 className="font-semibold text-xs text-foreground mt-0.5 tracking-tight truncate">
                Take Out Compost &amp; Cardboard
              </h3>
              <p className="text-muted-foreground text-[10px]">Curbside bin collection by alley</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNudgeAlex}
            className="px-2.5 py-1 min-h-[44px] rounded-lg bg-card border border-border text-foreground hover:bg-surface-container-high active:scale-95 transition-all text-xs font-semibold shrink-0 cursor-pointer"
          >
            Nudge 🔔
          </button>
        </div>

        {/* Stamp Card 3 (Completed Sarah) */}
        <div className="p-2.5 px-3 rounded-xl bg-surface-container/60 border border-border flex items-start justify-between gap-3 opacity-70">
          <div className="flex items-start gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-card border border-border flex items-center justify-center text-muted-foreground mt-0.5 shrink-0">
              <CheckCheck className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-[10px] font-mono">8:15 AM · Sarah</span>
                <span className="text-[10px] font-semibold uppercase text-emerald-600 dark:text-emerald-400 font-mono">
                  Verified
                </span>
              </div>
              <h3 className="font-medium text-xs text-muted-foreground line-through mt-0.5 tracking-tight truncate">
                Refill Brita &amp; Clean Espresso Tray
              </h3>
            </div>
          </div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/20 px-2 py-0.5 rounded shrink-0 font-mono">
            STAMPED ✓
          </div>
        </div>
      </div>

      {/* Duty Rhythm Mini Tracker */}
      <div className="bg-surface-container border border-border p-3 rounded-xl space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-xs text-foreground font-display">
            Flat Duty Rhythm
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
            8 of 10 done (80%)
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 pt-0.5">
          {['M', 'T', 'W', 'T', 'F'].map((day, idx) => (
            <div
              key={`day-${idx}`}
              className="flex flex-col items-center gap-1 p-1 bg-card rounded-lg border border-border"
            >
              <span className="text-[9px] font-mono text-muted-foreground">{day}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            </div>
          ))}
          {/* Today (Saturday) */}
          <div className="flex flex-col items-center gap-1 p-1 bg-card rounded-lg border border-primary/40">
            <span className="text-[9px] font-mono text-primary font-bold">S</span>
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          </div>
          {/* Tomorrow (Sunday) */}
          <div className="flex flex-col items-center gap-1 p-1 bg-card rounded-lg border border-border opacity-50">
            <span className="text-[9px] font-mono text-muted-foreground">S</span>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-container-high" />
          </div>
        </div>

        <div className="pt-1.5 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/60">
          <span>Next: Leo · Deep Clean Sink</span>
          <span className="text-foreground font-semibold">Tomorrow night</span>
        </div>
      </div>
    </section>
  );
}

export default DutyStampPunchcard;
