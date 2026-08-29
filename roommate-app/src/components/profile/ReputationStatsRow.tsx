import { Flame, ShieldCheck, Building2 } from 'lucide-react';

type Props = {
  choreStreak?: number;
  reliableSettlerRate?: number;
  activeSpacesCount?: number;
};

export default function ReputationStatsRow({
  choreStreak = 12,
  reliableSettlerRate = 100,
  activeSpacesCount = 1,
}: Props) {
  return (
    <section className="flex gap-3 overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-3 max-w-2xl mx-auto w-full pb-1 scrollbar-none">
      {/* 1. Chore Streak */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:-translate-y-0.5 transition-all min-w-[120px] snap-center flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
          <Flame className="w-5 h-5 fill-primary/20" />
        </div>
        <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
          {choreStreak}
        </span>
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mt-0.5">
          Chore Streak
        </span>
      </div>

      {/* 2. Reliable Settler */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:-translate-y-0.5 transition-all min-w-[120px] snap-center flex-1">
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
          <ShieldCheck className="w-5 h-5 fill-emerald-500/20" />
        </div>
        <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
          {reliableSettlerRate}%
        </span>
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mt-0.5">
          Reliable Settler
        </span>
      </div>

      {/* 3. Active Spaces */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-xs hover:-translate-y-0.5 transition-all min-w-[120px] snap-center flex-1">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-1">
          <Building2 className="w-5 h-5" />
        </div>
        <span className="text-xl sm:text-2xl font-black text-foreground tabular-nums">
          {activeSpacesCount}
        </span>
        <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider mt-0.5">
          Active Spaces
        </span>
      </div>
    </section>
  );
}
