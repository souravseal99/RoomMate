import { Sparkles, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChoreToggle } from '@/hooks/useChoreToggle';
import type { RecentChoreActivity } from '@/types/dashboardTypes';

interface Props {
  chores: RecentChoreActivity[];
}

export default function TodayChoresCarousel({ chores }: Props) {
  const navigate = useNavigate();
  const { toggleChore, isUpdating } = useChoreToggle();

  return (
    <section className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-extrabold tracking-tight text-foreground flex items-center gap-1.5">
          Today's Chores
        </h3>
        <button
          type="button"
          onClick={() => navigate('/chores')}
          className="text-primary text-xs font-bold uppercase tracking-wider hover:underline cursor-pointer"
        >
          See All
        </button>
      </div>

      {chores && chores.length > 0 ? (
        <div className="flex gap-3.5 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 no-scrollbar">
          {chores.map((chore) => {
            const isCompleted = chore.status === 'COMPLETED';

            return (
              <div
                key={chore.id}
                className={`shrink-0 w-48 rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between group relative overflow-hidden ${
                  isCompleted
                    ? 'bg-surface-container-low border-border/40 opacity-70'
                    : 'bg-card border-border shadow-xs hover:border-primary/50'
                }`}
              >
                {/* Card Top */}
                <div>
                  <div className="flex justify-between items-start mb-2.5">
                    <Sparkles
                      className={`w-4 h-4 ${
                        isCompleted ? 'text-muted-foreground' : 'text-primary'
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        isCompleted
                          ? 'bg-muted text-muted-foreground'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {chore.status}
                    </span>
                  </div>
                  <p
                    className={`font-bold text-sm leading-tight truncate mb-1 ${
                      isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    {chore.title}
                  </p>
                  <p className="text-[11px] text-muted-foreground truncate">
                    Assigned: {chore.assignee}
                  </p>
                </div>

                {/* Card Bottom: Progress & Toggle Checkbox */}
                <div className="flex items-center justify-between gap-2 mt-4 pt-2 border-t border-border/30">
                  <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'w-full bg-green-600' : 'w-1/3 bg-primary'
                      }`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleChore(chore)}
                    disabled={isUpdating}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
                      isCompleted
                        ? 'bg-green-600 border-green-600 text-white'
                        : 'border-primary/40 hover:border-primary text-primary'
                    }`}
                    aria-label={`Mark ${chore.title} ${isCompleted ? 'incomplete' : 'complete'}`}
                  >
                    {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 text-center text-muted-foreground text-sm">
          No chores scheduled for today ✨
        </div>
      )}
    </section>
  );
}
