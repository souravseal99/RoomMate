import { ClipboardList } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ChoresEmptyStateProps {
  onAddChore?: () => void;
}

export function ChoresEmptyState({ onAddChore }: ChoresEmptyStateProps) {
  return (
    <Card className="flex flex-col items-center justify-center min-h-[320px] p-8 bg-card/60 rounded-2xl border-dashed border-2 border-border/70 text-center select-none shadow-none">
      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
        <ClipboardList className="h-6 w-6 stroke-[2.2]" />
      </div>
      <h3 className="text-lg font-bold font-display text-foreground mb-1">No chores found</h3>
      <p className="text-xs text-muted-foreground mb-5 max-w-sm">
        There are no chores assigned to this household yet. Toss a task on the board to get started.
      </p>
      {onAddChore && (
        <Button
          type="button"
          onClick={onAddChore}
          className="bg-primary hover:bg-primary/90 text-primary-foreground min-h-[44px] rounded-full font-bold px-6 shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          Create a new chore
        </Button>
      )}
    </Card>
  );
}

export default ChoresEmptyState;
