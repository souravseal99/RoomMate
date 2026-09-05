import { Flame, Check, Trash2, Calendar, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getInitials } from '@/utils/utils';
import type { ChoreItem } from '@/types/choreTypes';

interface ChoreTimelineCardProps {
  chore: ChoreItem;
  isOverdue?: boolean;
  onToggle: (chore: ChoreItem) => void;
  onDelete?: (choreId: string) => void;
}

export function ChoreTimelineCard({
  chore,
  isOverdue = false,
  onToggle,
  onDelete,
}: ChoreTimelineCardProps) {
  const isCompleted = chore.completed;
  const isHighPriority = chore.priority === 'HIGH' && !isCompleted;
  const assigneeName = chore.assignedToName || 'Unassigned';
  const initials = getInitials(assigneeName);

  return (
    <article
      className={`rounded-2xl p-4 transition-all duration-200 flex items-center justify-between gap-3.5 group relative overflow-hidden ${
        isCompleted
          ? 'bg-surface-container-low border border-border/40 opacity-60'
          : isHighPriority
            ? 'bg-primary/10 border-2 border-primary/30 shadow-xs hover:border-primary/50'
            : isOverdue
              ? 'bg-destructive/5 border border-destructive/20 shadow-xs'
              : 'bg-card border border-border shadow-xs hover:border-primary/40'
      }`}
    >
      {/* Left: Assignee Avatar + Details */}
      <div className="flex items-center gap-3.5 flex-1 min-w-0">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border ${
            isCompleted
              ? 'bg-muted text-muted-foreground border-border/40'
              : isHighPriority
                ? 'bg-primary text-primary-foreground border-primary/40'
                : 'bg-surface-container text-foreground border-border'
          }`}
          title={`Assigned to ${assigneeName}`}
        >
          {chore.assignedToName ? (
            <span>{initials}</span>
          ) : (
            <UserIcon className="w-5 h-5 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={`font-bold text-sm sm:text-base leading-snug truncate ${
                isCompleted
                  ? 'line-through text-muted-foreground'
                  : 'text-foreground'
              }`}
            >
              {chore.description}
            </h3>

            {isHighPriority && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                <Flame className="w-3 h-3 fill-primary text-primary" />
                <span>Urgent</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground font-medium flex-wrap">
            <span className="flex items-center gap-1 truncate">
              👤 {assigneeName}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{chore.frequency}</span>
            </span>
            {chore.notes && (
              <span className="truncate italic text-muted-foreground/80">
                • {chore.notes}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions & Circular Completion Checkbox */}
      <div className="flex items-center gap-2 shrink-0">
        {onDelete && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onDelete(chore.choreId)}
            className="w-8 h-8 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Delete chore"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}

        {/* Tactile Circular Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(chore)}
          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all active:scale-90 ${
            isCompleted
              ? 'bg-green-600 border-green-600 text-white'
              : 'border-primary/40 hover:border-primary text-primary bg-card'
          }`}
          aria-label={`Mark "${chore.description}" as ${
            isCompleted ? 'incomplete' : 'complete'
          }`}
        >
          {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
        </button>
      </div>
    </article>
  );
}

export default ChoreTimelineCard;
